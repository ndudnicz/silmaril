import { Component } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { ToastWrapper } from '../../utils/toast.wrapper';
import { UserService } from '../../services/user.service';
import { VaultService } from '../../services/vault.service';

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
    private router: Router,
    private authService: AuthService,
    private userService: UserService
  ) { }
  loading = false;

  async onSubmit() {
    try {
      this.spinner.show();
      this.loading = true;
      const result = await this.authService.authAsync(this.form.value.username, this.form.value.password)
      ToastWrapper.success('Authentication successful');
      const user = await this.userService.getUserAsync();
      VaultService.setSalt(user.salt);
      this.router.navigate(['/home']);
    } catch (error: any) {
      console.log(error);
      
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      ToastWrapper.error(errorMessage, null);
    } finally {
      this.loading = false;
      this.spinner.hide();
    }
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