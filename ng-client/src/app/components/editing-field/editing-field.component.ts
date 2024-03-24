import { Component } from '@angular/core';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { MonacoBinding } from 'y-monaco';
import * as Y from 'yjs';
import * as awarenessProtocol from 'y-protocols/awareness.js';
import { SocketService } from 'src/app/socket/socket.service';
import { ViewEncapsulation } from '@angular/core';
import { state } from '@angular/animations';
import * as monaco from 'monaco-editor';
@Component({
  selector: 'app-editing-field',
  templateUrl: './editing-field.component.html',
  styleUrls: ['./editing-field.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class EditingFieldComponent {
  editorOptions = {
    theme: 'vs-light',
    language: 'javascript',
  };
  code: string = 'function demo(){ console.log("hey")}';
  editor: any;
  binding: any;
  model0: any;
  model1: any;

  //yjs initialization
  ydoc = new Y.Doc();
  ytext = this.ydoc.getText('monaco');
  // ytext1 = this.ydoc.getText('monaco1');

  //y-protocols awareness initialization
  awareness = new awarenessProtocol.Awareness(this.ydoc);

  constructor(private socketService: SocketService) {
    //listens for events on the ydoc and sends to other clients
    this.ydoc.on('update', (updates) => {
      this.socketService.sendUpdates(updates);
      // console.log('sending');
      // console.log(updates);
    });

    //on receiving an update from others
    this.socketService.socket.on('receive-updates', (updates) => {
      Y.applyUpdate(this.ydoc, new Uint8Array(updates));
      // console.log('receiving');
      // console.log(updates);
    });

    //configuring awareness instance
    const username = sessionStorage.getItem('username');
    if (username)
      this.awareness.setLocalStateField('user', {
        name: username,
        color: this.colorGenerator(),
      });
    else console.log("couldn't instantiate awareness object with username");

    //sending awareness updates to server for relay
    this.awareness.on('update', () => {
      const updates = awarenessProtocol.encodeAwarenessUpdate(
        this.awareness,
        Array.from(this.awareness.getStates().keys())
      );
      this.socketService.sendAwareness(updates);
    });

    //on receiving awareness updates from other clients
    this.socketService.socket.on('receive-awareness', (updates) => {
      awarenessProtocol.applyAwarenessUpdate(
        this.awareness,
        new Uint8Array(updates),
        null
      );
      // console.log(new Uint8Array(updates));

      this.styleAwareness();
    });
  }

  //function to update remote nametags and cursor styles
  styleAwareness() {
    let states = Array.from(this.awareness.getStates().entries());

    states.forEach((elt) => {
      let tag: any = document.querySelector(`.yRemoteSelectionHead-${elt[0]}`);
      if (tag) {
        // tag.setAttribute('data-nametag', elt[1]['user'].name);
        tag.style.borderColor = elt[1]['user'].color;
        let span = document.createElement('span');
        span.textContent = elt[1]['user'].name;
        span.style.backgroundColor = elt[1]['user'].color;
        tag.replaceChildren(span);
      }
    });
  }

  //generates/picks a random color for a user
  colorGenerator() {
    const letters = '0123456789ABCDEF'.split('');
    let color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.round(Math.random() * 15)];
    }

    //for later purposes
    sessionStorage.setItem('color', color);
    return color;
  }

  // exposes monaco instance + y-monaco binding to ydoc
  onInit(editor: any) {
    this.editor = editor;
    this.binding = new MonacoBinding(
      this.ytext,
      this.editor.getModel(),
      new Set([this.editor]),
      this.awareness
    );

    //save current model
    this.model0 = this.editor.getModel();
    //creating new model
    this.model1 = monaco.editor.createModel('function random()');
  }
}
