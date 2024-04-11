import { Component } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { ViewChild } from '@angular/core';
import { SocketService } from 'src/app/socket/socket.service';
import { v4 as uuidv4 } from 'uuid';
import { HostListener } from '@angular/core';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  constructor(
    private authService: AuthService,
    private socketService: SocketService
  ) {
    this.socketService.socket.on('joined-room', (roomID) => {
      //closing popup + displaying leave button
      sessionStorage.setItem('roomID', roomID);
      this.toggle();
      this.toggleConnectOptions();
    });

    this.socketService.socket.on('no-such-room', () => {
      this.errorDiv.nativeElement.style.display = 'block';
    });
  }

  @ViewChild('roomID')
  roomID: any;
  @ViewChild('copyButton')
  copyButton: any;
  @ViewChild('roomIDInput')
  roomIDInput: any;
  @ViewChild('connectButton')
  connectButton: any;
  @ViewChild('leaveButton')
  leaveButton: any;
  @ViewChild('error')
  errorDiv: any;

  //options could go back to normal ('connect') afte refresh
  @HostListener('document:DOMContentLoaded', ['$event'])
  handlePageRefresh(event: any) {
    this.toggleConnectOptions();
  }

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

  OnCreateRoom() {
    var buttons = document.getElementById('buttons');
    buttons?.classList.add('dis');
    var copy = document.getElementById('copy-id');
    copy?.classList.add('dis-flex');
    //modified
    copy?.classList.remove('dis');

    //calls socket service to create room
    this.createRoom();
  }

  OnJoinRoom() {
    this.errorDiv.nativeElement.style.display = 'none';
    this.roomIDInput.nativeElement.value = '';
    var buttons = document.getElementById('buttons');
    buttons?.classList.add('dis');
    var joinRoom = document.getElementById('join-room');
    joinRoom?.classList.add('dis-flex');
    //modified
    joinRoom?.classList.remove('dis');
  }

  //to-be-implemented as wanted
  OnLeaveRoom() {
    sessionStorage.removeItem('roomID');
    window.location.reload();
  }

  //copies roomID to user's clipboard

  async copyID(): Promise<void> {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(
          this.roomID.nativeElement.textContent
        );
      } else {
        // Use the 'out of viewport hidden text area' trick
        const textArea = document.createElement('textarea');
        textArea.value = this.roomID.nativeElement.textContent;

        // Move textarea out of the viewport so it's not visible
        textArea.style.position = 'absolute';
        textArea.style.left = '-999999px';

        document.body.prepend(textArea);
        textArea.select();

        document.execCommand('copy');

        textArea.remove();
      }
      this.copyButton.nativeElement.textContent = 'copied';
      //displays leave button
      this.toggleConnectOptions();
    } catch (e) {
      console.log(e);
      alert('error: you have to manually copy');
    }
  }

  //
  toggleConnectOptions() {
    const roomID = sessionStorage.getItem('roomID');
    if (roomID) {
      this.connectButton.nativeElement.style.display = 'none';
      this.leaveButton.nativeElement.style.display = 'block';
    } /*else {
      this.leaveButton.nativeElement.style.display = 'none';
      this.connectButton.nativeElement.style.display = 'block';
    }*/
  }

  //admitting the requested socket to created room first
  createRoom() {
    this.roomID.nativeElement.textContent = uuidv4();
    this.socketService.createRoom(this.roomID.nativeElement.textContent);
  }

  //admits to the requested room
  joinRoom() {
    this.socketService.joinRoom(this.roomIDInput.nativeElement.value);
  }
}
