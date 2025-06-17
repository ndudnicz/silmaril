import { Component } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatTooltipModule,
    MatDividerModule,
    RouterLink,
  ],
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.css'
})
export class SigninComponent {
  usernameFormControl = new FormControl('');
  passwordFormControl = new FormControl('');
  form: FormGroup = new FormGroup({
    username: this.usernameFormControl,
    password: this.passwordFormControl
  });

  constructor(
    private spinner: NgxSpinnerService,
    private router: Router
  ) {}
  loading = true;

  async onSubmit() {
    this.spinner.show();
    this.loading = true;
    const result = await AuthService.authAsync(this.form.value.username, this.form.value.password)
    this.loading = false;
    this.spinner.hide();
    if (result) {
      console.log('Login successful');
      console.log('token:', AuthService.getJwtToken());
      this.router.navigate(['/home']);
    } else {
      console.error('Login failed');
      // Handle login failure (e.g., show an error message)
    }
    console.log('Form submitted:', this.form.value);
  }

  keypress(event: KeyboardEvent) {
    if (this.passwordFormControl.valid
      && this.usernameFormControl.valid
      && event.key === 'Enter') {
      event.stopImmediatePropagation();
      event.preventDefault();
      this.onSubmit();
    }
  }

  signin() {
  }
}