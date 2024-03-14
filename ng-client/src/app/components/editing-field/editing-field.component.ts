import { Component } from '@angular/core';
import * as Y from 'yjs';
import { ViewChild } from '@angular/core';
import { SocketService } from 'src/app/socket/socket.service';
import { MonacoBinding } from 'y-monaco';

@Component({
  selector: 'app-editing-field',
  templateUrl: './editing-field.component.html',
  styleUrls: ['./editing-field.component.css'],
})
export class EditingFieldComponent {
  editorOptions = { theme: 'vs-light', language: 'javascript' };
  code: string = '';
  monaco: any;

  @ViewChild('textarea')
  textarea: any;

  //yjs integration
  ydoc = new Y.Doc();
  ytext = this.ydoc.getText('experiment');

  constructor(private socketService: SocketService) {
    //defines what to do once the updates from a client arrives
    //have to create a new Uint8Array from the received data
    //otherwise "unexpected end of array error" will be thrown from the client side
    this.socketService.socket.on('receive-updates', (update) => {
      Y.applyUpdate(this.ydoc, new Uint8Array(update));
    });
  }

  onInit(monaco: any) {
    this.monaco = monaco;
  }

  OnInput(e: any) {
    // console.log(e);
    console.log(this.monaco.getPosition());
    if (e.data == null && e.inputType == 'deleteContentBackward') {
      this.ytext.delete(this.monaco.getPosition()['column'] - 2, 1);
    } else {
      this.ytext.insert(this.monaco.getPosition()['column'] - 2, e.data);
    }

    console.log(this.ytext.length);
    console.log(this.ytext.toString());

    //extracting the current updates to ydoc
    const update = Y.encodeStateAsUpdate(this.ydoc);
    //sends the updates to clients
    this.socketService.sendUpdates(update);
  }

  OnKeyUp(e: any) {
    if (e.key == 'Backspace') {
      this.ytext.delete(this.monaco.getPosition()['column'] - 1, 1);

      //extracting the current updates to ydoc
      const update = Y.encodeStateAsUpdate(this.ydoc);
      //sends the updates to clients
      this.socketService.sendUpdates(update);
    }
  }
}
