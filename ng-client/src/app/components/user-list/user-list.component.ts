import { Component } from '@angular/core';
import { SocketService } from 'src/app/socket/socket.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
})
export class UserListComponent {
  members: Array<string> = ['You' /*,  'Max', 'Eva'*/];

  constructor(private socketService: SocketService) {}

  addMember(member: string) {
    this.members.push(member);
  }

  removeMember(member: string) {
    this.members.splice(this.members.indexOf(member), 1);
  }
}
