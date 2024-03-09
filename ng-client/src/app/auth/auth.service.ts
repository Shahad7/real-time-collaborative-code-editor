import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private router: Router) {}

  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    if (token) return true;
    return false;
  }

  login(token: string): void {
    localStorage.setItem('token', token);
    this.router.navigateByUrl('/code-editor');
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigateByUrl('/login');
  }
}
