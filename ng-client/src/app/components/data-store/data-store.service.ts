import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataStoreService {
  private uploadAnnouncementSource = new Subject<'ready' | 'not ready'>();
  private fileToUploadSource = new Subject<string>();
  private fileContentSource = new Subject<string>();
  private fileCountSource = new Subject<number>();
  private fileCountAnnouncementSource = new Subject<'ready' | 'not ready'>();
  private fileUploadCompleteAnnouncementSource = new Subject<'done'>();
  private fileUploadErrorSource = new Subject<string>();

  uploadAnnouncement$ = this.uploadAnnouncementSource.asObservable();
  fileToUpload$ = this.fileToUploadSource.asObservable();
  fileUploadError$ = this.fileUploadErrorSource.asObservable();
  fileContent$ = this.fileContentSource.asObservable();
  fileCount$ = this.fileCountSource.asObservable();
  fileCountAnnouncement$ = this.fileCountAnnouncementSource.asObservable();
  fileUploadCompleteAnnouncement$ =
    this.fileUploadCompleteAnnouncementSource.asObservable();

  triggerUpload() {
    this.uploadAnnouncementSource.next('ready');
  }
  fetchFileContent(fileID: string) {
    this.fileToUploadSource.next(fileID);
  }

  publishFileContent(fileContent: string) {
    this.fileContentSource.next(fileContent);
  }

  queryCount() {
    this.fileCountAnnouncementSource.next('ready');
  }

  publishCount(count: number) {
    this.fileCountSource.next(count);
  }

  alertCompletion() {
    this.fileUploadCompleteAnnouncementSource.next('done');
  }
  alertError() {
    this.fileUploadErrorSource.next('error');
  }

  constructor() {}
}
