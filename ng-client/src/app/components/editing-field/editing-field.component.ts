import { Component } from '@angular/core';
import * as Y from 'yjs';
import { ViewChild } from '@angular/core';
import { SocketService } from 'src/app/socket/socket.service';
import { YArray, YText } from 'yjs/dist/src/internals';
import { TextAreaBinding } from 'y-textarea';
import { AfterViewInit } from '@angular/core';
import { HighlightModule } from 'ngx-highlightjs';
import { HighlightLoader } from 'ngx-highlightjs';

@Component({
  selector: 'app-editing-field',
  templateUrl: './editing-field.component.html',
  styleUrls: ['./editing-field.component.css'],
})
export class EditingFieldComponent implements AfterViewInit {
  @ViewChild('textarea')
  textarea: any;
  @ViewChild('pre')
  pre: any;
  @ViewChild('code')
  code: any;
  value: string = ``;

  //changeMargin flag
  textareaMarginSet: boolean = false;

  //yjs integration
  ydoc = new Y.Doc();
  ytextarea = this.ydoc.getText('textArea');

  constructor(
    private socketService: SocketService,
    private hljsLoader: HighlightLoader
  ) {
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

  //add/remove margin to textarea so cursor position can be synced after linenumbers are visible
  changeMargin(key: string) {
    if (!this.textareaMarginSet) {
      setTimeout(() => {
        if (key == 'enter' && !this.textareaMarginSet) {
          const elt: any = document.querySelector('.hljs-ln-n');

          if (!elt) {
            this.changeMargin('enter');
          } else {
            this.textarea.nativeElement.style.marginLeft =
              elt.getBoundingClientRect().width + 10 + 'px';
            this.textareaMarginSet = true;
          }
        }
      }, 10);
    } else {
      if (key == 'backspace') {
        if (!document.querySelector('.hljs-ln-n')) {
          this.textarea.nativeElement.style.marginLeft = '0px';
        }
      }
    }
  }

  syncScroll() {
    this.pre.nativeElement.scrollTop = this.textarea.nativeElement.scrollTop;
    this.pre.nativeElement.scrollLeft = this.textarea.nativeElement.scrollLeft;
  }

  sendUpdates() {
    //extracting the current updates to ydoc
    const update = Y.encodeStateAsUpdate(this.ydoc);
    //sends the updates to clients
    this.socketService.sendUpdates(update);
  }

  onKeyDownTab(e: Event) {
    e.preventDefault();
    const start = this.textarea.nativeElement.selectionStart;
    const end = this.textarea.nativeElement.selectionEnd;
    const value = this.textarea.nativeElement.value;
    this.textarea.nativeElement.value =
      value.substring(0, start) + '  ' + value.substring(end);
  }
}
