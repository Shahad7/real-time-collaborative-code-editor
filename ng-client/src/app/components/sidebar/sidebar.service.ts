import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  private currentSidebarOptionSource = new Subject<
    'explorer' | 'chatbox' | 'view-members' | 'room-log'
  >();

  currentSidebarOption$ = this.currentSidebarOptionSource.asObservable();

  selectOption(option: 'explorer' | 'chatbox' | 'view-members' | 'room-log') {
    this.currentSidebarOptionSource.next(option);
  }

  constructor() {}
}
