import { Component } from '@angular/core';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { MonacoBinding } from 'y-monaco';
import * as Y from 'yjs';
import * as awarenessProtocol from 'y-protocols/awareness.js';
import { SocketService } from 'src/app/socket/socket.service';
import { ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-editing-field',
  templateUrl: './editing-field.component.html',
  styleUrls: ['./editing-field.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class EditingFieldComponent {
  editorOptions = { theme: 'vs-light', language: 'javascript' };
  code: string = 'function demo(){ console.log("hey")}';
  editor: any;
  binding: any;

  //yjs initialization
  ydoc = new Y.Doc();
  ytext = this.ydoc.getText('monaco');

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
        color: '#ffb61e',
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

      // console.log(this.awareness.getStates());
    });
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
  }
}
