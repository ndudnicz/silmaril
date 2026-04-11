import { Component, inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { ToastWrapper } from '../../utils/toast.wrapper';
import { UserService } from '../../services/user.service';
import { VaultService } from '../../services/vault.service';
import { BaseComponent } from '../base-component/base-component.component';
import { take } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    IconFieldModule,
    InputIconModule,
    ButtonModule
  ],
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.css'
})
export class SigninComponent extends BaseComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly vaultService = inject(VaultService);
  protected readonly usernameFormControl = new FormControl('');
  protected readonly passwordFormControl = new FormControl('');
  protected readonly form: FormGroup = new FormGroup({
    username: this.usernameFormControl,
    password: this.passwordFormControl
  });

  ngOnInit(): void {
    this.authService.getCsrfCookie();
  }

  onSubmit() {
    this.startLoading();
    this.authService.auth$(this.form.value.username, this.form.value.password)
      .pipe(take(1))
      .subscribe({
        next: () => this.onAuthSuccess(),
        error: (error: any) => {
          this.displayError('Authentication failed', error);
          this.stopLoading();
        }
      });
  }

  onAuthSuccess() {
    ToastWrapper.success('Authentication successful');
    this.userService.getUser$().pipe(take(1)).subscribe({
      next: (user) => {
        console.log('user:', user);
        this.vaultService.setSalt(user.saltBase64);
        this.stopLoading();
        this.router.navigate(['/vault']);
      },
      error: (error: any) => {
        this.displayError('Error fetching user:', error);
        this.stopLoading();
      }
    });
  }

  keypress(event: KeyboardEvent) {
    if (this.form.valid && event.key === 'Enter') {
      event.stopImmediatePropagation();
      event.preventDefault();
      this.onSubmit();
    }
  }
}
