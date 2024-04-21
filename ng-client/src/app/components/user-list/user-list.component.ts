import { Component, ViewChild } from '@angular/core';
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
  inRoom: boolean = false;

  @ViewChild('inviteDiv')
  inviteDiv: any;
  @ViewChild('copyButton2')
  copyButton2: any;
  @ViewChild('inviteDivContainer')
  inviteDivContainer: any;

  constructor(
    private socketService: SocketService,
    private userListService: UserListService
  ) {
    if (sessionStorage.getItem('username')) {
      this.currentUser = sessionStorage.getItem('username') ?? '';
    }
    if (sessionStorage.getItem('roomID')) {
      this.inRoom = true;
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
    this.userListService.alertCount(this.members.length);
  }

  removeMember(member: string) {
    this.members.splice(this.members.indexOf(member), 1);
    this.userListService.alertCount(this.members.length);
  }

  makeAdmin(admin: string) {
    this.isAdmin = false;
    sessionStorage.setItem('isAdmin', 'false');
    this.socketService.changeAdmin(admin);
  }

  invitePPL() {
    this.inviteDivContainer.nativeElement.style.display = 'flex';

    const roomID = sessionStorage.getItem('roomID');
    if (roomID) {
      this.inRoom = true;
      setTimeout(() => {
        this.copyButton2.nativeElement.textContent = 'copy ID';
        this.inviteDiv.nativeElement.textContent = roomID;
      }, 0);
    } else {
      this.inRoom = false;
    }
  }
  onCopy() {
    this.copyID();
  }

  closeInviteDiv() {
    this.inviteDivContainer.nativeElement.style.display = 'none';
  }
  async copyID(): Promise<void> {
    try {
      const roomID = sessionStorage.getItem('roomID');
      if (roomID) {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(
            this.inviteDiv.nativeElement.textContent
          );
        } else {
          // Use the 'out of viewport hidden text area' trick
          const textArea = document.createElement('textarea');
          textArea.value = this.inviteDiv.nativeElement.textContent;

          // Move textarea out of the viewport so it's not visible
          textArea.style.position = 'absolute';
          textArea.style.left = '-999999px';

          document.body.prepend(textArea);
          textArea.select();

          document.execCommand('copy');

          textArea.remove();
        }
        this.copyButton2.nativeElement.textContent = 'copied';
      } else throw new Error('no roomID found for this user');
    } catch (e) {
      console.log(e);
      alert('error: you have to manually copy');
    }
  }
}
