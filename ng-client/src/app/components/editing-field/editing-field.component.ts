import { Component } from '@angular/core';
import * as Y from 'yjs';
import { ViewChild } from '@angular/core';
import { SocketService } from 'src/app/socket/socket.service';
import { YArray, YText } from 'yjs/dist/src/internals';
import { TextAreaBinding } from 'y-textarea';
import { AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-editing-field',
  templateUrl: './editing-field.component.html',
  styleUrls: ['./editing-field.component.css'],
})
export class EditingFieldComponent implements AfterViewInit {
  @ViewChild('textarea')
  textarea: any;

  //yjs integration
  ydoc = new Y.Doc();
  ytextarea = this.ydoc.getText('textArea');

  constructor(private socketService: SocketService) {
    //defines what to do once the updates from a client arrives
    //have to create a new Uint8Array from the received data
    //otherwise "unexpected end of array error" will be thrown from the client side
    this.socketService.socket.on('receive-updates', (update) => {
      Y.applyUpdate(this.ydoc, new Uint8Array(update));
    });

    //applying event listener to ytextarea :Y.Text
    this.ytextarea.observe((e) => {
      console.log(e);
      this.sendUpdates();
    });
  }

  ngAfterViewInit(): void {
    const areabinding = new TextAreaBinding(
      this.ytextarea,
      this.textarea.nativeElement
    );
  }

  sendUpdates() {
    //extracting the current updates to ydoc
    const update = Y.encodeStateAsUpdate(this.ydoc);
    //sends the updates to clients
    this.socketService.sendUpdates(update);
  }
}
