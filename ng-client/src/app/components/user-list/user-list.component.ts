import { Component } from '@angular/core';
import { SocketService } from 'src/app/socket/socket.service';
import { UserListService } from './user-list.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
})
export class UserListComponent {
  members: Array<string> = ['You' /*,  'Max', 'Eva'*/];

  constructor(
    private socketService: SocketService,
    private userListService: UserListService
  ) {
    this.socketService.socket.on('members', (members) => {
      let currentUser: string | null = '';
      if (sessionStorage.getItem('username')) {
        currentUser = sessionStorage.getItem('username');
      }
      // console.log(members);

      members.forEach((elt: string) => {
        if (elt != currentUser) {
          this.addMember(elt);
        }
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
}
