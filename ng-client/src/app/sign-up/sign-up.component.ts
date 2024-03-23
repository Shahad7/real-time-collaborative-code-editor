import { Component } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ViewChild } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css'],
})
export class SignUpComponent {
  constructor(private router: Router) {}
  @ViewChild('error')
  errorDiv: any;

  signupForm = new FormGroup({
    name: new FormControl(''),
    email: new FormControl(''),
    password: new FormControl(''),
    confirm_password: new FormControl(''),
  });

  async OnSubmit() {
    try {
      const response = await fetch(
        `http://${window.location.hostname}':3000/signup`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          mode: 'cors',
          body: JSON.stringify({
            name: this.signupForm.value.name ?? '',
            email: this.signupForm.value.email ?? '',
            password: this.signupForm.value.password ?? '',
            confirm_password: this.signupForm.value.confirm_password ?? '',
          }),
        }
      );
      const data = await response.json();
      if (!data['success']) {
        this.errorDiv.nativeElement.textContent = data['error'];
      } else {
        this.router.navigateByUrl('/login');
      }
    } catch (e) {
      console.error(e);
    }
  }
}
