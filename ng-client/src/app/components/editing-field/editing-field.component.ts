import { Component } from '@angular/core';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { MonacoBinding } from 'y-monaco';
import * as Y from 'yjs';
import { SocketService } from 'src/app/socket/socket.service';

@Component({
  selector: 'app-editing-field',
  templateUrl: './editing-field.component.html',
  styleUrls: ['./editing-field.component.css'],
})
export class EditingFieldComponent {
  editorOptions = { theme: 'vs-light', language: 'javascript' };
  code: string = 'function demo(){ console.log("hey")}';
  editor: any;
  binding: any;

  //yjs initialization
  ydoc = new Y.Doc();
  ytext = this.ydoc.getText('monaco');

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
  }

  //monaco instance + y-monaco binding to ydoc
  onInit(editor: any) {
    this.editor = editor;
    this.binding = new MonacoBinding(
      this.ytext,
      this.editor.getModel(),
      new Set([this.editor]),
      null
    );
  }
}
