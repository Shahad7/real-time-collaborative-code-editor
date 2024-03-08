import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  login(): Promise<boolean> {
    return Promise.resolve(true);
  }

  logout(): void {
    this.isLoggedIn = false;
  }
  isLoggedIn = false;
  redirectUrl: string = '/code-editor';
}
