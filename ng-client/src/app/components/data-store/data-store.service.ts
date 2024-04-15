import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataStoreService {
  private uploadAnnouncementSource = new Subject<'ready' | 'not ready'>();
  private fileToUploadSource = new Subject<string>();
  private fileContentSource = new Subject<string>();

  uploadAnnouncement$ = this.uploadAnnouncementSource.asObservable();
  fileToUpload$ = this.fileToUploadSource.asObservable();
  fileContent$ = this.fileContentSource.asObservable();

  triggerUpload() {
    this.uploadAnnouncementSource.next('ready');
  }
  fetchFileContent(fileID: string) {
    this.fileToUploadSource.next(fileID);
  }

  publishFileContent(fileContent: string) {
    this.fileContentSource.next(fileContent);
  }

  constructor() {}
}
