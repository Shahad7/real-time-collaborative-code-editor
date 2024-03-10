import { Component } from '@angular/core';
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
    if (token && !this.socketService.isConnected()) {
      this.socketService.connect();
    }
  }
}
