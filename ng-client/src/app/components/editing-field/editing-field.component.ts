import { Component, importProvidersFrom } from '@angular/core';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { MonacoBinding } from 'y-monaco';
import * as Y from 'yjs';
import * as awarenessProtocol from 'y-protocols/awareness';
import { SocketService } from 'src/app/socket/socket.service';
import { ViewEncapsulation } from '@angular/core';
import { state } from '@angular/animations';
import * as monaco from 'monaco-editor';
import { FileExplorerService } from 'src/app/components/explorer/file-explorer.service';
import { HostListener } from '@angular/core';
import { DataStoreService } from '../data-store/data-store.service';

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
  monaco: any;
  binding: any;
  models: any = {};
  states: any = {};
  languages: any = {
    css: 'css',
    js: 'javascript',
    ts: 'typescript',
    java: 'java',
    c: 'c',
    py: 'python',
    html: 'html',
    json: 'json',
    md: 'markdown',
    mjs: 'javascript',
  };

  //yjs initialization
  ydoc = new Y.Doc();
  ymap: any = this.ydoc.getMap('monaco');

  //y-protocols awareness initialization
  awareness = new awarenessProtocol.Awareness(this.ydoc);

  //remove awareness instance of disconnected user
  @HostListener('window:beforeunload', ['$event'])
  removeDisconnectedAwareness(e: BeforeUnloadEvent): void {
    e.preventDefault();
    this.socketService.purgeDeadAwareness(this.awareness.clientID);
    // console.log('purge req sent');

    awarenessProtocol.removeAwarenessStates(
      this.awareness,
      [this.awareness.clientID],
      'window unload'
    );
  }

  constructor(
    private socketService: SocketService,
    private explorerService: FileExplorerService,
    private dataStoreService: DataStoreService
  ) {
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

    //to purge offline client's awareness instance
    this.socketService.socket.on('purge-awareness', (clientID) => {
      //console.log('purge req received for ' + clientID);
      awarenessProtocol.removeAwarenessStates(
        this.awareness,
        [clientID],
        'window unload'
      );
    });

    //subscribing to file switch events
    this.explorerService.selectedFile$.subscribe((file) => {
      //saving current model and state before switching
      let currentModel: any, currentState, currentFileID;
      if (this.editor.getModel() != null) {
        currentModel = this.editor.getModel();
        currentState = this.editor.saveViewState();
        currentFileID = Object.keys(this.models).find(
          (elt) => this.models[elt] == currentModel
        );
        this.states[currentFileID as any] = currentState;
        //console.log('state saved for ' + currentFileID);
      }

      // if the currently selected file already has a model created,
      //fetch it and restore state
      if (this.models[file.id]) {
        this.editor.setModel(this.models[file.id]);
        if (this.states[file.id])
          this.editor.restoreViewState(this.states[file.id]);
      }

      //if the selected file is new without an associated model,
      //create a model after detecting the language
      if (!this.models[file.id]) {
        let model;
        let index: any = file.name.split('.').pop();
        let language = this.languages[index];
        // console.log('detected language as ' + language);
        if (language != null && language != undefined)
          model = this.monaco.editor.createModel('', language);
        else model = this.monaco.editor.createModel('');
        this.models[file.id] = model;
      }

      //if the current file doesn't already have a YText instance, instantiate
      if (!this.ymap.has(file.id)) {
        this.ymap.set(file.id, new Y.Text());
      }

      //destroy current binding if any before new binding
      if (this.binding) this.binding.destroy();

      //set model and also create new binding
      this.editor.setModel(this.models[file.id]);
      this.binding = new MonacoBinding(
        this.ymap.get(file.id),
        this.models[file.id],
        new Set([this.editor]),
        this.awareness
      );
      this.editor.focus();
    });

    //dataStoreService : publishing the file's content when demanded
    this.dataStoreService.fileToUpload$.subscribe((fileID) => {
      if (this.models[fileID]) {
        this.dataStoreService.publishFileContent(
          this.models[fileID].getValue()
        );
      } else if (this.ymap.has(fileID)) {
        this.dataStoreService.publishFileContent(
          this.ymap.get(fileID).toString()
        );
      } else {
        this.dataStoreService.publishFileContent(' ');
        console.warn(
          'warning : no model or ytext instance found for file with id : ' +
            fileID
        );
      }
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
      let selection: any = document.querySelector(
        `.yRemoteSelection-${elt[0]}`
      );
      if (selection) {
        //changing remote user text selection color
        selection.style.backgroundColor = elt[1]['user'].color;
      }
    });
  }

  //to make the color darker
  ColorLuminance(hex: string, lum: number) {
    // validate hex string
    hex = String(hex).replace(/[^0-9a-f]/gi, '');
    if (hex.length < 6) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    lum = lum || 0;

    // convert to decimal and change luminosity
    var rgb = '#',
      c,
      i;
    for (i = 0; i < 3; i++) {
      c = parseInt(hex.substr(i * 2, 2), 16);
      c = Math.round(Math.min(Math.max(0, c + c * lum), 255)).toString(16);
      rgb += ('00' + c).substr(c.length);
    }

    return rgb;
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
    sessionStorage.setItem('username-color', this.ColorLuminance(color, -0.2));

    return color;
  }

  // exposes monaco editor instance
  onInit(editor: any) {
    //saving the editor instance
    this.editor = editor;
    //setting ref to global monaco instance
    this.monaco = (window as any).monaco;

    //detaching initial model from the editor instance simply cuz we don't want it
    this.editor.setModel(null);
  }
}
