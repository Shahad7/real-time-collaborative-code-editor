import { AfterRenderOptions, Component } from '@angular/core';
import { HostListener } from '@angular/core';
import { SocketService } from './socket/socket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'main-proj';
  constructor(private socketService: SocketService) {}

  @HostListener('document:DOMContentLoaded', ['$event'])
  handlePageRefresh(event: any) {
    const token = sessionStorage.getItem('token');
    const userID = sessionStorage.getItem('userID') ?? '';
    const username = sessionStorage.getItem('username') ?? '';
    const roomID = sessionStorage.getItem('roomID') ?? '';
    if (token && !this.socketService.isConnected()) {
      this.socketService.setAuth(userID, username);
      this.socketService.connect(roomID);
    }
  }
}
