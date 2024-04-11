import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SocketService } from '../socket/socket.service';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private router: Router, private socketService: SocketService) {}

  isLoggedIn(): boolean {
    const token = sessionStorage.getItem('token');
    if (token) return true;
    return false;
  }

  login(token: string, user: { username: string; _id: string }): void {
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('username', user.username);
    sessionStorage.setItem('userID', user._id);
    this.socketService.setAuth(user._id, user.username);
    this.socketService.connect(null);
    this.router.navigateByUrl('/code-editor');
  }

  logout(): void {
    sessionStorage.removeItem('token');
    this.socketService.disconnect();
    sessionStorage.clear();
    this.router.navigateByUrl('/login');
  }
}
