import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserListService {
  private joinedUserSource = new Subject<string>();
  private leftUserSource = new Subject<string>();

  joinedUser$ = this.joinedUserSource.asObservable();
  leftUser$ = this.leftUserSource.asObservable();

  alertUserJoin(username: string) {
    this.joinedUserSource.next(username);
  }
  alertUserLeave(username: string) {
    this.leftUserSource.next(username);
  }
  constructor() {}
}
