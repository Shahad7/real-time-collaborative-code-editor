import { Component } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  constructor(private authService: AuthService) {}

  logout() {
    this.authService.logout();
  }

  toggle() {
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
  }

  joinRoom() {
    var buttons = document.getElementById('buttons');
    buttons?.classList.add('dis');
    var copy = document.getElementById('join-room');
    copy?.classList.add('dis-flex');
  }
}
