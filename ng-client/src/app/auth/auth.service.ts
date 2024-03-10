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

  login(token: string): void {
    sessionStorage.setItem('token', token);
    this.socketService.connect();
    this.router.navigateByUrl('/code-editor');
  }

  logout(): void {
    sessionStorage.removeItem('token');
    sessionStorage.clear();
    this.router.navigateByUrl('/login');
  }
}
