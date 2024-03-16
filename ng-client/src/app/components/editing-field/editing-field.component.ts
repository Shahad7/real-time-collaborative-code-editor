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

    this.yarray.insert(0, [new Y.Text()]);
    this.yarray.get(0).insert(0, 'abcd');
    // this.yarray.get(0).insert(1, 'c');
    // this.yarray.get(0).insert(1, 'b');

    // this.yarray.insert(1, [new Y.Text('def')]);
    // this.yarray.insert(2, [new Y.Text('d3f')]);
    // this.yarray.insert(3, [new Y.Text('deddwedf')]);
  }

  onInit(monaco: any) {
    this.monaco = monaco;

    this.monaco.onKeyDown(() => {
      this.prevCursorPositionColumn = this.monaco.getPosition()['column'];
      // console.log('oi' + this.prevCursorPositionColumn);
      //console.log(this.monaco.getPosition());
    });

    this.monaco.onDidChangeModelContent((e: any) => {
      console.log(e.changes[0]);
      console.log('auto:' + this.monaco.getPosition());
      console.log(e.changes[0].text.length);
      if (e.changes[0].text == '    ' || e.changes[0].text == '   ') {
        this.overridenPosition = this.monaco.getPosition();
        console.log('set');
      }
    });

    this.monaco.onDidChangeCursorPosition((e: any) => {
      console.log('changed' + this.monaco.getPosition());
      // if (this.overridenPosition != null) {
      //   console.log('here');
      //   this.monaco.setPosition(this.overridenPosition);
      //   this.overridenPosition = null;
      // }
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
      if (
        column != this.prevCursorPositionColumn &&
        column - 1 >= 0 &&
        this.yarray.get(lineNumber - 1)
      ) {
        this.yarray.get(lineNumber - 1).delete(column - 1, 1);
      }
      //extracting the current updates to ydoc
      const update = Y.encodeStateAsUpdate(this.ydoc);
      //sends the updates to clients
      this.socketService.sendUpdates(update);
    } else if (e.key == 'Tab') {
      console.log('tab0' + this.monaco.getPosition());
      const { lineNumber, column } = this.monaco.getPosition();
      this.initializeYTextElement(lineNumber);
      let startIndex = this.prevCursorPositionColumn - 1;
      console.log('startIndex :' + startIndex);
      for (let i = 0; i < 4; i++)
        this.yarray.get(lineNumber - 1).insert(startIndex, ' ');
      console.log(
        'ytext: ' +
          this.yarray.get(lineNumber - 1).toString() +
          'length: ' +
          this.yarray.get(lineNumber - 1).length
      );
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
