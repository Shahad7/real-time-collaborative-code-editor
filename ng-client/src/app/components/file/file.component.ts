import { Component, Input } from '@angular/core';
import { FileExplorerService } from 'src/app/components/explorer/file-explorer.service';
import { DataStoreService } from '../data-store/data-store.service';
import { SocketService } from 'src/app/socket/socket.service';

@Component({
  selector: 'app-file',
  templateUrl: './file.component.html',
  styleUrls: ['./file.component.css'],
})
export class FileComponent {
  @Input() filename: string = '';
  @Input() path: string = '';
  @Input() id: string = '';
  value: string = '';

  constructor(
    private explorerService: FileExplorerService,
    private dataStoreService: DataStoreService,
    private socketService: SocketService
  ) {
    const uploadFile = async () => {
      try {
        this.dataStoreService.fetchFileContent(this.id);
        if (!sessionStorage.getItem('roomID')) {
          throw new Error('user not in a room');
        }
        const response = await fetch(
          `http://${window.location.hostname}:3000/file/upload`,
          {
            method: 'POST',
            mode: 'cors',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              filename: this.filename,
              fileID: this.id,
              roomID: sessionStorage.getItem('roomID'),
              value: this.value,
              path: this.path,
            }),
          }
        );

        const data = await response.json();
        if (data.success) {
          this.dataStoreService.alertCompletion(this.id);
        } else if (data.error) {
          console.log("couldn't upload file " + this.filename);
          this.dataStoreService.alertError();
        }
      } catch (e: any) {
        console.log("couldn't save file : " + this.filename);
        console.error(e);
      }
    };

    //announcing its existence
    this.dataStoreService.fileCountAnnouncement$.subscribe((value) => {
      if (value == 'ready') {
        this.dataStoreService.publishCount(this.id);
      }
    });

    //save file to db on triggerUpload : dataStoreService
    this.dataStoreService.uploadAnnouncement$.subscribe((value) => {
      if (value == 'ready') {
        uploadFile();
      }
    });

    //store file-to-be-uploaded's content on class variable value
    this.dataStoreService.fileContent$.subscribe((value) => {
      this.value = value;
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

  deleteFile() {
    this.socketService.deleteFile(this.id);
  }
}
