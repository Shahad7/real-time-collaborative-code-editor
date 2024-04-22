import { AfterRenderOptions, Component } from '@angular/core';
import { HostListener } from '@angular/core';
import { SocketService } from './socket/socket.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'main-proj';
  constructor(
    private socketService: SocketService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        let current_path = this.router.url;
        if (current_path == '/code-editor/room-log') {
          const token = sessionStorage.getItem('token');
          const userID = sessionStorage.getItem('userID') ?? '';
          const username = sessionStorage.getItem('username') ?? '';
          const roomID = sessionStorage.getItem('roomID') ?? '';
          this.socketService.setAuth(userID, username);
          this.socketService.connect(roomID);
        }
      }
    });
  }

  @HostListener('document:DOMContentLoaded', ['$event'])
  handlePageRefresh(event: any): void {
    event.preventDefault();
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
