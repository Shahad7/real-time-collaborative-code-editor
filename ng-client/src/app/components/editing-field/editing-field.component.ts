import { Component } from '@angular/core';

@Component({
  selector: 'app-editing-field',
  templateUrl: './editing-field.component.html',
  styleUrls: ['./editing-field.component.css']
})
export class EditingFieldComponent {
  editorOptions = { theme: 'vs-light', language: 'html' };
  code: string = '<!DOCTYPE html> \n <html lang="en"> \n <head> \n\t <meta charset="UTF-8"> \n\t <meta name="viewport" content="width=device-width, initial-scale=1.0"> \n\t <title>Document</title> \n </head> \n <body> \n\t <h1> \n\t\t Hello World \n\t</h2> \n </body> \n </html>';
}
