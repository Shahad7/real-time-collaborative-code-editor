import { Component } from '@angular/core';
import { SocketService } from 'src/app/socket/socket.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
})
export class UserListComponent {
  members: Array<string> = ['You' /*,  'Max', 'Eva'*/];

  constructor(private socketService: SocketService) {
    this.socketService.socket.on('members', (members) => {
      let currentUser: string | null = '';
      if (sessionStorage.getItem('username')) {
        currentUser = sessionStorage.getItem('username');
      }
      console.log(members);

      members.forEach((elt: string) => {
        if (elt != currentUser) {
          this.addMember(elt);
        }
      });
    });

    this.socketService.socket.on('someone-joined', (username) => {
      if (!this.members.includes(username)) this.addMember(username);
    });

    this.socketService.socket.on('someone-left', (username) => {
      this.removeMember(username);
    });
  }

  addMember(member: string) {
    this.members.push(member);
  }

  removeMember(member: string) {
    this.members.splice(this.members.indexOf(member), 1);
  }
}
