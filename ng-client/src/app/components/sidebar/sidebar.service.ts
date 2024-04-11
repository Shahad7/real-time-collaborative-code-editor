import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  private currentSidebarOptionSource = new Subject<
    'explorer' | 'chatbox' | 'view-members'
  >();

  currentSidebarOption$ = this.currentSidebarOptionSource.asObservable();

  selectOption(option: 'explorer' | 'chatbox' | 'view-members') {
    this.currentSidebarOptionSource.next(option);
  }

  constructor() {}
}
