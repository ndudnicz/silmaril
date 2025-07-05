import { Component, inject, OnInit } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { FormGroup, FormControl, ReactiveFormsModule, ValidatorFn, AbstractControl } from '@angular/forms';
import { AuthHelper } from '../helpers/auth.helper';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';
import { toast } from 'ngx-sonner';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastWrapper } from '../../utils/toast.wrapper';
import { BaseComponent } from '../base-component/base-component.component';
import { take } from 'rxjs';
import { AuthService } from '../../services/auth.service';

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
    MatCardModule,
    RouterLink
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent extends BaseComponent implements OnInit {
  usernameFormControl = new FormControl('');
  passwordFormControl = new FormControl('', this.passwordValidator());
  confirmPasswordFormControl = new FormControl('', this.confirmPasswordValidator());
  form: FormGroup = new FormGroup({
    username: this.usernameFormControl,
    password: this.passwordFormControl,
    confirmPassword: this.confirmPasswordFormControl
  });

  displayPasswordRequirements = false;

  constructor(
    private userService: UserService,
    private router: Router,
    private authService: AuthService,
  ) {
    super(inject(NgxSpinnerService));
  }

  ngOnInit(): void {
    this.authService.getCsrfCookie();
  }

  async onSubmit() {
    this.startLoading();
    this.userService.createUser$(
      this.form.value.username,
      this.form.value.password,
      this.form.value.confirmPassword
    ).pipe(take(1)).subscribe({
      next: () => this.onUserCreationSuccess(),
      error: (error: any) => {
        this.displayError('Error during user creation:', error);
        this.stopLoading();
      }
    });
  }

  onUserCreationSuccess() {
    ToastWrapper.success('User created successfully, please sign in.');
    this.form.reset();
    this.stopLoading();
    this.router.navigate(['/signin']);
  }

  passwordValidator(): ValidatorFn {
    return (control: AbstractControl<string>): { [key: string]: any } | null => {
      const isValid = AuthHelper.checkPasswordFormat(control.value);
      return isValid ? null : { 'invalidPassword': { value: control.value } };
    };
  }

  confirmPasswordValidator(): ValidatorFn {
    return (control: AbstractControl<string>): { [key: string]: any } | null => {
      let password = control.root?.get('password')?.value;
      if (password && control.value && control.value !== password) {
        return { 'passwordMismatch': { value: control.value } };
      }
      return null;
    };
  }

  inputFocusOut() {
    this.displayPasswordRequirements = this.passwordFormControl.invalid;
  }

  keypress(event: KeyboardEvent) {
    if (this.form.valid && event.key === 'Enter') {
      event.stopImmediatePropagation();
      event.preventDefault();
      this.onSubmit();
    }
  }
}