import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.component.html',
  styleUrls: ['./folder.component.css'],
})
export class FolderComponent {
  @Input() foldername: string = '';
  @Input() files: Array<string> = [];

  toggleFolder(folderContents: HTMLElement, arrow: HTMLImageElement): void {
    if (folderContents) {
      folderContents.classList.toggle('expanded');
      if (arrow) {
        arrow.style.transform =
          arrow.style.transform == 'rotate(90deg)'
            ? 'rotate(0deg)'
            : 'rotate(90deg)';
      }
    }
  }
  activate(folderDetails: HTMLElement) {
    document.querySelectorAll('.active').forEach((elt) => {
      elt.classList.remove('active');
    });
    if (folderDetails) {
      folderDetails.classList.add('active');
    }
  }

  cancelClosing(e: any): void {
    e.stopPropagation();
  }
}
