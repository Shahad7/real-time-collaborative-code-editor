import { Component } from '@angular/core';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { MonacoBinding } from 'y-monaco';
import * as Y from 'yjs';

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

  ydoc = new Y.Doc();
  ytext = this.ydoc.getText('monaco');
  constructor() {}

  onInit(editor: any) {
    this.editor = editor;
    //console.log(this.editor);
    this.binding = new MonacoBinding(
      this.ytext,
      this.editor.getModel(),
      new Set([this.editor]),
      null
    );
    console.log(this.binding);
  }
}
