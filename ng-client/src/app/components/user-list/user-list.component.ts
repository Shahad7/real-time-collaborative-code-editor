import { Component } from '@angular/core';
import { SocketService } from 'src/app/socket/socket.service';
import { UserListService } from './user-list.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
})
export class UserListComponent {
  members: Array<string> = [
    'You',
    /*,  'Max', 'Eva'*/
  ];
  currentUser: string = '';
  admin: string = '';
  isAdmin: boolean = false;

  constructor(
    private socketService: SocketService,
    private userListService: UserListService
  ) {
    if (sessionStorage.getItem('username')) {
      this.currentUser = sessionStorage.getItem('username') ?? '';
    }
    let isAdmin = sessionStorage.getItem('isAdmin');
    if (isAdmin && isAdmin == 'true') {
      this.isAdmin = true;
    }

    this.userListService.adminCheck$.subscribe((val) => {
      if (val == 'check') {
        let isAdmin = sessionStorage.getItem('isAdmin');
        if (isAdmin && isAdmin == 'true') {
          this.isAdmin = true;
        }
      }
    });

    //know current admin
    this.socketService.socket.on('know-admin', (admin) => {
      this.admin = admin;
    });

    //know when admin changes
    this.socketService.socket.on('new-admin', (admin) => {
      this.admin = admin;
      if (this.currentUser == admin) {
        this.isAdmin = true;
        this.userListService.alertNewAdmin('You');
      } else {
        this.isAdmin = false;
        sessionStorage.setItem('isAdmin', 'false');
        this.userListService.alertNewAdmin(admin);
      }
    });
    this.socketService.socket.on('members', (members) => {
      // console.log(members);

      members.forEach((elt: string) => {
        if (elt != this.currentUser) this.addMember(elt);
      });
    });

    this.socketService.socket.on('someone-joined', (username) => {
      this.userListService.alertUserJoin(username);
      if (!this.members.includes(username)) this.addMember(username);
    });

    this.socketService.socket.on('someone-left', (username) => {
      this.userListService.alertUserLeave(username);
      if (this.members.includes(username)) this.removeMember(username);
    });
  }

  addMember(member: string) {
    this.members.push(member);
  }

  removeMember(member: string) {
    this.members.splice(this.members.indexOf(member), 1);
  }

  makeAdmin(admin: string) {
    this.isAdmin = false;
    sessionStorage.setItem('isAdmin', 'false');
    this.socketService.changeAdmin(admin);
  }
}
