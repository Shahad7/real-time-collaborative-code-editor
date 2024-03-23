import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent {
  constructor() {}

  toggleFolder(e: any): void {
    let folder = e.target.closest('.folder');
    console.log(folder);
    const folderContents = folder.querySelector('.folder-contents');
    console.log(folderContents);
    if (folderContents) {
      folderContents.classList.toggle('expanded');
    }
  }

  cancelClosing(e: any): void {
    e.stopPropagation();
  }
}
