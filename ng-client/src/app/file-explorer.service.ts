import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FileExplorerService {
  toggleFolder(folderElement: HTMLElement): void {
    folderElement.classList.toggle('expanded');
    const folderContents = folderElement.querySelector('.folder-contents');
    if (folderContents) {
      folderContents.classList.toggle('hidden');
    }
  }
}
