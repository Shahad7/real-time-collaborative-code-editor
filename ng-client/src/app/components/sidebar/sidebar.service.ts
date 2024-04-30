import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  private currentSidebarOptionSource = new Subject<
    'explorer' | 'chatbox' | 'view-members' | 'room-log'
  >();
  private navigationAnnouncementSource = new Subject<string>();
  private departureSource = new Subject<string>();
  private messageCountUpdateSource = new Subject<string>();

  currentSidebarOption$ = this.currentSidebarOptionSource.asObservable();
  navigationAnnouncement$ = this.navigationAnnouncementSource.asObservable();
  departure$ = this.departureSource.asObservable();
  messageCountUpdate$ = this.messageCountUpdateSource.asObservable();

  selectOption(option: 'explorer' | 'chatbox' | 'view-members' | 'room-log') {
    this.currentSidebarOptionSource.next(option);
  }

  announceNavigation(option: string) {
    this.navigationAnnouncementSource.next(option);
  }

  alertDeparture() {
    this.departureSource.next('depart');
  }

  updateMessageCount() {
    this.messageCountUpdateSource.next('new');
  }

  constructor() {}
}
