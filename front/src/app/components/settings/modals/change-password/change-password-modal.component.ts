import { Component, inject } from '@angular/core';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
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
import { ConfirmModalComponent } from '../../../modals/confirm-modal/confirm-modal.component';
import { BaseComponent } from '../../../base-component/base-component.component';
import { take } from 'rxjs';

@Component({
  selector: 'app-change-password-modal',
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
  templateUrl: './change-password-modal.component.html',
  styleUrl: './change-password-modal.component.css'
})
export class ChangePasswordModalComponent extends BaseComponent {
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
    private dialogRef: MatDialogRef<ChangePasswordModalComponent>,
    private authService: AuthService,
    private dialog: MatDialog
  ) {
    super(inject(NgxSpinnerService));
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

  async onSubmit() {
    this.dialog.open(ConfirmModalComponent, {
      panelClass: 'custom-modal',
      data: {
        title: 'Confirm Password Change',
        message: 'Are you sure you want to change your password? This is not your master password.',
        confirmText: 'Confirm',
        cancelText: 'Cancel'
      }
    }).afterClosed().pipe(take(1)).subscribe(async (confirmed: boolean) => {
      console.log('Confirm modal closed with confirmation:', confirmed);
      if (confirmed) {
        this.saveSettings();
      } else {
        this.closeDialog();
      }
    });

  }

  saveSettings() {
    if (this.form.invalid) {
      console.error('Form is invalid:', this.form.errors);
      return;
    }
    this.startLoading();
    this.userService.changePassword$(
      this.oldPasswordFormControl.value!,
      this.newPasswordFormControl.value!,
    ).pipe(take(1)).subscribe({
      next: () => {
        this.onPasswordChangeSuccess();
      },
      error: (error: any) => {
        console.error('Error changing password:', error);
        ToastWrapper.error('Error changing password', error.message ?? error);
        this.stopLoading();
        throw error;
      }
    });
  }

  onPasswordChangeSuccess() {
    ToastWrapper.success('Password changed successfully');
    this.form.reset();
    this.authService.signout$().pipe(take(1)).subscribe({
      next: () => {
        ToastWrapper.success('Signed out successfully')
        setTimeout(() => {
          window.location.reload();
        }, 1500)
      },
      error: (error: any) => {
        console.error('Signout error:', error);
        ToastWrapper.error('Signout error', error.message ?? error);
        this.stopLoading();
        throw error;
      }
    });
  }

  closeDialog() {
    this.dialogRef.close();
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
