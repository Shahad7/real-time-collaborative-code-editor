import { Component } from '@angular/core';
import * as Y from 'yjs';

@Component({
  selector: 'app-editing-field',
  templateUrl: './editing-field.component.html',
  styleUrls: ['./editing-field.component.css'],
})
export class EditingFieldComponent {
  editorOptions = { theme: 'vs-light', language: 'javascript' };
  code: string = 'function demo(){ console.log("hey")}';
}
