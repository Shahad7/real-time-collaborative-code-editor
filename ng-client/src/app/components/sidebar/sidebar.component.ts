import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  constructor() {}

  toggleFolder(folder: HTMLElement): void {
    folder.classList.toggle('expanded');
    const folderContents = folder.querySelector('.folder-contents');
    if (folderContents) {
      folderContents.classList.toggle('hidden');
    }
  }
}

