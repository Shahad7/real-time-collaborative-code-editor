import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-file',
  templateUrl: './file.component.html',
  styleUrls: ['./file.component.css'],
})
export class FileComponent {
  @Input() filename: string = '';

  activate(file: HTMLElement) {
    document.querySelectorAll('.active').forEach((elt) => {
      elt.classList.remove('active');
    });
    file.classList.add('active');
  }
}
