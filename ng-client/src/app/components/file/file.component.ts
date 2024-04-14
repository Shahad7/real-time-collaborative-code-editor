import { Component, Input } from '@angular/core';
import { FileExplorerService } from 'src/app/components/explorer/file-explorer.service';
import { DataStoreService } from '../explorer/data-store.service';

@Component({
  selector: 'app-file',
  templateUrl: './file.component.html',
  styleUrls: ['./file.component.css'],
})
export class FileComponent {
  @Input() filename: string = '';
  @Input() path: string = '';
  @Input() id: string = '';

  constructor(
    private explorerService: FileExplorerService,
    private dataStoreService: DataStoreService
  ) {
    //save file to db on triggerUpload : dataStoreService
    const uploadFile = async () => {
      try {
        if (!sessionStorage.getItem('roomID')) {
          throw new Error('user not in a room');
        }
        fetch(`http://${window.location.hostname}:3000/file/upload`, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filename: this.filename,
            fileID: this.id,
            roomID: sessionStorage.getItem('roomID'),
          }),
        });
      } catch (e) {
        console.log("couldn't save file : " + this.filename);
        console.error(e);
      }
    };
    this.dataStoreService.uploadAnnouncement$.subscribe((value) => {
      if (value == 'ready') {
        uploadFile();
      }
    });
  }

  activate(file: HTMLElement) {
    document.querySelectorAll('.active').forEach((elt) => {
      elt.classList.remove('active');
    });
    file.classList.add('active');
  }

  selectFile(): void {
    this.explorerService.selectFile({
      name: this.filename,
      path: this.path,
      id: this.id,
    });
  }
}
