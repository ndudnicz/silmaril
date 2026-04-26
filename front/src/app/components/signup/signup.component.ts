import { Component, inject, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  ReactiveFormsModule,
  ValidatorFn,
  AbstractControl,
} from '@angular/forms';
import { AuthHelper } from '../helpers/auth.helper';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';
import { ToastWrapper } from '../../utils/toast.wrapper';
import { BaseComponent } from '../base-component/base-component.component';
import { take } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MessageModule } from 'primeng/message';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    IconFieldModule,
    InputIconModule,
    ButtonModule,
    MessageModule,
    InputTextModule,
  ],
  templateUrl: './signup.component.html',
})
export class SignupComponent extends BaseComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  protected readonly usernameFormControl = new FormControl('');
  protected readonly passwordFormControl = new FormControl('', this.passwordValidator());
  protected readonly confirmPasswordFormControl = new FormControl(
    '',
    this.confirmPasswordValidator(),
  );
  protected readonly form: FormGroup = new FormGroup({
    username: this.usernameFormControl,
    password: this.passwordFormControl,
    confirmPassword: this.confirmPasswordFormControl,
  });

  // displayPasswordRequirements = false;

  ngOnInit(): void {
    this.authService.getCsrfCookie();
  }

  async onSubmit() {
    this.startLoading();
    this.userService
      .createUser$(
        this.form.value.username,
        this.form.value.password,
        this.form.value.confirmPassword,
      )
      .pipe(take(1))
      .subscribe({
        next: () => this.onUserCreationSuccess(),
        error: (error: unknown) => {
          this.displayError('Error during user creation:', error);
          this.stopLoading();
        },
      });
  }

  onUserCreationSuccess() {
    ToastWrapper.success('User created successfully, please sign in.');
    this.form.reset();
    this.stopLoading();
    this.router.navigate(['/signin']);
  }

  passwordValidator(): ValidatorFn {
    return (control: AbstractControl<string>): Record<string, unknown> | null => {
      const isValid = AuthHelper.checkPasswordFormat(control.value);
      return isValid ? null : { invalidPassword: { value: control.value } };
    };
  }

  confirmPasswordValidator(): ValidatorFn {
    return (control: AbstractControl<string>): Record<string, unknown> | null => {
      const password = control.root?.get('password')?.value;
      console.log(control.root?.get('password')?.value, control.value);

      if (password && control.value && control.value !== password) {
        return { passwordMismatch: { value: control.value } };
      }
      return null;
    };
  }

  keypress(event: KeyboardEvent) {
    if (this.form.valid && event.key === 'Enter') {
      event.stopImmediatePropagation();
      event.preventDefault();
      this.onSubmit();
    }
  }
}
