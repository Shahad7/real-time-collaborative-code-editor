import { Component } from '@angular/core';
import * as Y from 'yjs';
import { ViewChild } from '@angular/core';
import { SocketService } from 'src/app/socket/socket.service';
import { MonacoBinding } from 'y-monaco';
import { YArray, YText } from 'yjs/dist/src/internals';

@Component({
  selector: 'app-editing-field',
  templateUrl: './editing-field.component.html',
  styleUrls: ['./editing-field.component.css'],
})
export class EditingFieldComponent {
  editorOptions = {
    theme: 'vs-light',
    language: 'javascript',
    autoIndent: 'none',
    autoClosingBrackets: 'never',
    autoClosingComments: 'never',
    autoClosingDelete: 'never',
    autoClosingOvertype: 'never',
    autoClosingQuotes: 'never',
    autoSurround: 'never',

    quickSuggestions: {
      other: false,
      comments: false,
      strings: false,
    },
    parameterHints: {
      enabled: false,
    },
    ordBasedSuggestions: false,
    suggestOnTriggerCharacters: false,
    acceptSuggestionOnEnter: 'off',
    tabCompletion: 'off',
    wordBasedSuggestions: false,
  };

  code: string = '';
  monaco: any;
  prevCursorPositionColumn: number = -1;
  overridenPosition = null;
  prevChangeText = '';

  @ViewChild('textarea')
  textarea: any;

  //yjs integration
  ydoc = new Y.Doc();
  yarray: YArray<YText> = this.ydoc.getArray('experiment');
  constructor(private socketService: SocketService) {
    //defines what to do once the updates from a client arrives
    //have to create a new Uint8Array from the received data
    //otherwise "unexpected end of array error" will be thrown from the client side
    this.socketService.socket.on('receive-updates', (update) => {
      Y.applyUpdate(this.ydoc, new Uint8Array(update));
    });

    // this.yarray.insert(0, [new Y.Text()]);
    // this.yarray.get(0).insert(0, 'abcd');
    // this.yarray.get(0).insert(1, 'c');
    // this.yarray.get(0).insert(1, 'b');
  }

  onInit(monaco: any) {
    this.monaco = monaco;

    this.monaco.onKeyDown(() => {
      console.log('keydown :' + this.monaco.getPosition());
      this.prevCursorPositionColumn = this.monaco.getPosition()['column'];
    });

    this.monaco.onDidChangeCursorPosition(() => {
      console.log(this.monaco.getPosition());
    });

    this.monaco.onDidChangeModelContent((e: any) => {
      console.log(e);
    });
  }

  initializeYTextElement(lineNumber: number) {
    if (!this.yarray.get(lineNumber - 1)) {
      this.yarray.insert(lineNumber - 1, [new Y.Text()]);
    }
  }

  OnInput(e: any) {
    //console.log(e);
    // console.log('input event: ' + this.monaco.getPosition());
    const { lineNumber, column } = this.monaco.getPosition();
    // console.log(this.monaco);
    this.initializeYTextElement(lineNumber);
    if (e.data == null && e.inputType == 'insertLineBreak') {
      e.preventDefault();
      this.monaco.setPosition(this.monaco.getPosition());
    } else {
      this.yarray.get(lineNumber - 1).insert(column - 2, e.data);
    }

    //extracting the current updates to ydoc
    const update = Y.encodeStateAsUpdate(this.ydoc);
    //sends the updates to clients
    this.socketService.sendUpdates(update);
  }

  OnKeyUp(e: any) {
    if (e.key == 'Backspace') {
      console.log('keyup event: ' + this.monaco.getPosition());
      const { lineNumber, column } = this.monaco.getPosition();
      //checks if it's at column 1 and
      // if there's anything to delete in its left (extreme left avoid)
      if (
        column != this.prevCursorPositionColumn &&
        column - 1 >= 0 &&
        this.yarray.get(lineNumber - 1)
      ) {
        if (
          this.yarray
            .get(lineNumber - 1)
            .toString()
            .substring(column - 1, column + 3) == '    '
        ) {
          //checks if a \t can be deleted : could be buggy
          this.yarray.get(lineNumber - 1).delete(column - 1, 4);
        } else if (
          this.yarray
            .get(lineNumber - 1)
            .toString()
            .charAt(column - 2) == '\n'
        ) {
          alert('ooi');
        } else {
          this.yarray.get(lineNumber - 1).delete(column - 1, 1);
        }
      }

      //extracting the current updates to ydoc
      const update = Y.encodeStateAsUpdate(this.ydoc);
      //sends the updates to clients
      this.socketService.sendUpdates(update);
    } else if (e.key == 'Tab') {
      const { lineNumber, column } = this.monaco.getPosition();
      this.initializeYTextElement(lineNumber);
      //inserts 4 spaces if at the beginning of a row
      //inserts 3 spaces if there is a space or character before current position
      if (
        this.yarray
          .get(lineNumber - 1)
          .toString()
          .charAt(this.prevCursorPositionColumn - 2) == '' ||
        this.yarray
          .get(lineNumber - 1)
          .toString()
          .charAt(this.prevCursorPositionColumn - 2) == ' '
      )
        this.yarray
          .get(lineNumber - 1)
          .insert(this.prevCursorPositionColumn - 1, '    ');
      else
        this.yarray
          .get(lineNumber - 1)
          .insert(this.prevCursorPositionColumn - 1, '   ');

      //extracting the current updates to ydoc
      const update = Y.encodeStateAsUpdate(this.ydoc);
      //sends the updates to clients
      this.socketService.sendUpdates(update);
    }
  }
  //returns the value of monaco editor. One way bind technically
  getValue(): string {
    let value: string = '';
    if (this.yarray.length > 0) {
      for (let i = 0; i < this.yarray.length; i++) {
        if (i != this.yarray.length - 1)
          value += this.yarray.get(i).toString() + '\n';
        else value += this.yarray.get(i).toString();
      }
    }
    return value;
  }
}
