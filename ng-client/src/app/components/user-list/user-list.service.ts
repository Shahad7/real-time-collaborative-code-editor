import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserListService {
  private joinedUserSource = new Subject<string>();
  private leftUserSource = new Subject<string>();
  private adminCheckSource = new Subject<string>();
  private newAdminSource = new Subject<string>();

  joinedUser$ = this.joinedUserSource.asObservable();
  leftUser$ = this.leftUserSource.asObservable();
  adminCheck$ = this.adminCheckSource.asObservable();
  newAdmin$ = this.newAdminSource.asObservable();
  alertUserJoin(username: string) {
    this.joinedUserSource.next(username);
  }
  alertUserLeave(username: string) {
    this.leftUserSource.next(username);
  }

  adminCheck() {
    this.adminCheckSource.next('check');
  }

  alertNewAdmin(admin: string) {
    this.newAdminSource.next(admin);
  }
  constructor() {}
}
