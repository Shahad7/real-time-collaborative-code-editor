import { Component } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { ViewChild } from '@angular/core';
import { SocketService } from 'src/app/socket/socket.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  constructor(
    private authService: AuthService,
    private socketService: SocketService
  ) {}

  @ViewChild('roomID')
  roomID: any;
  @ViewChild('copyButton')
  copyButton: any;
  @ViewChild('roomIDInput')
  roomIDInput: any;

  logout() {
    this.authService.logout();
  }

  toggle() {
    //resetting textContent of copy button
    this.copyButton.nativeElement.textContent = 'Copy ID';

    var popup = document.getElementById('popup');
    popup?.classList.toggle('active');

    // If 'copy-id' is present, hide it
    var copy = document.getElementById('copy-id');
    if (copy && copy.classList.contains('dis-flex')) {
      copy.classList.add('dis');
    }

    // If 'join-room' is present, hide it
    var joinRoom = document.getElementById('join-room');
    if (joinRoom && joinRoom.classList.contains('dis-flex')) {
      joinRoom.classList.add('dis');
    }

    setTimeout(() => {
      var buttons = document.getElementById('buttons');
      buttons?.classList.remove('dis');
    }, 500);
  }

  createRoom() {
    var buttons = document.getElementById('buttons');
    buttons?.classList.add('dis');
    var copy = document.getElementById('copy-id');
    copy?.classList.add('dis-flex');
    //modified
    copy?.classList.remove('dis');

    //admitting the requested socket to created room first
    this.socketService.createRoom(this.roomID.nativeElement.textContent);
  }

  joinRoom() {
    var buttons = document.getElementById('buttons');
    buttons?.classList.add('dis');
    var joinRoom = document.getElementById('join-room');
    joinRoom?.classList.add('dis-flex');
    //modified
    joinRoom?.classList.remove('dis');

    //admits to the requested room
    this.socketService.joinRoom(this.roomID.nativeElement.textContent);
  }

  async copyID(): Promise<void> {
    try {
      await navigator.clipboard.writeText(
        this.roomID.nativeElement.textContent
      );
      this.copyButton.nativeElement.textContent = 'copied';
    } catch (e) {
      alert('error: you have to manually copy');
    }
  }
}
