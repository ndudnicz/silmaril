import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormControl, ReactiveFormsModule, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { UserService } from '../../../../services/user.service';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AuthHelper } from '../../../helpers/auth.helper';
import { MatCardModule } from '@angular/material/card';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastWrapper } from '../../../../utils/toast.wrapper';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-settings-modal',
  imports: [
    MatDialogModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule
  ],
  templateUrl: './settings-modal.component.html',
  styleUrl: './settings-modal.component.css'
})
export class SettingsModalComponent {

  loading = false;
  displayPasswordRequirements = false;
  oldPasswordFormControl = new FormControl('', [Validators.required]);
  newPasswordFormControl = new FormControl('', this.passwordValidator());
  confirmNewPasswordFormControl = new FormControl('', this.confirmPasswordValidator());
  form: FormGroup = new FormGroup({
    oldPassword: this.oldPasswordFormControl,
    newPassword: this.newPasswordFormControl,
    confirmNewPassword: this.confirmNewPasswordFormControl
  });

  constructor(
    private userService: UserService,
    private dialogRef: MatDialogRef<SettingsModalComponent>,
    private spinner: NgxSpinnerService,
    private authService: AuthService
  ) {
    // Initialization logic can go here
  }

  passwordValidator(): ValidatorFn {
    return (control: AbstractControl<string>): { [key: string]: any } | null => {
      const isValid = AuthHelper.checkPasswordFormat(control.value);
      return isValid ? null : { 'invalidPassword': { value: control.value } };
    };
  }

  confirmPasswordValidator(): ValidatorFn {
    return (control: AbstractControl<string>): { [key: string]: any } | null => {
      let password = control.root?.get('newPassword')?.value;
      if (password && control.value && control.value !== password) {
        return { 'passwordMismatch': { value: control.value } };
      }
      return null;
    };
  }

  // Add methods to handle settings actions
  async onSubmit() {
    console.log('Settings saved');
    this.spinner.show();
    if (this.form.invalid) {
      console.error('Form is invalid:', this.form.errors);
      this.spinner.hide();
      return;
    }
    this.loading = true;
    try {
      await this.userService.changePasswordAsync(
        this.oldPasswordFormControl.value!,
        this.newPasswordFormControl.value!,
      );
      ToastWrapper.success('Password changed successfully');
      this.form.reset();
      await this.authService.signoutAsync();
      setTimeout(() => {
        this.spinner.hide();
        window.location.reload();
      }, 1500)
    } catch (error: any) {
      console.error('Error changing password:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      ToastWrapper.error('Failed to change password', errorMessage);
    }
  }

  closeDialog() {
    console.log('Settings cancelled');
    this.dialogRef.close();
    // Implement cancel logic here
  }


  inputFocusOut() {
    this.displayPasswordRequirements = this.newPasswordFormControl.invalid;
  }

  keypress(event: KeyboardEvent) {
    if (this.form.valid
      && event.key === 'Enter') {
      event.stopImmediatePropagation();
      event.preventDefault();
      this.onSubmit();
    }
  }
}
