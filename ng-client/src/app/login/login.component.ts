import { Component } from '@angular/core';
import { ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  constructor(private authService: AuthService) {}
  @ViewChild('error')
  errorDiv: any;
  loginForm = new FormGroup({
    email: new FormControl(''),
    password: new FormControl(''),
  });

  async onSubmit() {
    try {
      const response = await fetch(
        `http://${window.location.hostname}:3000/login`,
        {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: this.loginForm.value.email ?? '',
            password: this.loginForm.value.password ?? '',
          }),
        }
      );
      const data = await response.json();
      if (!data['success']) {
        this.errorDiv.nativeElement.textContent = data['error'];
      } else this.authService.login(data['token'], data['user']);
    } catch (e) {
      console.error(e);
    }
  }
}
