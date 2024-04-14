import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataStoreService {
  private uploadAnnouncementSource = new Subject<'ready' | 'not ready'>();

  uploadAnnouncement$ = this.uploadAnnouncementSource.asObservable();

  triggerUpload() {
    this.uploadAnnouncementSource.next('ready');
  }

  constructor() {}
}
