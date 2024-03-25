import { Component, Input } from '@angular/core';
import { FileExplorerService } from 'src/app/file-explorer.service';

@Component({
  selector: 'app-file',
  templateUrl: './file.component.html',
  styleUrls: ['./file.component.css'],
})
export class FileComponent {
  @Input() filename: string = '';

  constructor(private explorerService: FileExplorerService) {}

  activate(file: HTMLElement) {
    document.querySelectorAll('.active').forEach((elt) => {
      elt.classList.remove('active');
    });
    file.classList.add('active');
  }

  selectFile(): void {
    this.explorerService.selectFile(this.filename);
  }
}
