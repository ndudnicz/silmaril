import { Component, inject, signal } from '@angular/core';
import {
  FormGroup,
  FormControl,
  ReactiveFormsModule,
  Validators,
  ValidatorFn,
  AbstractControl,
} from '@angular/forms';
import { UserService } from '../../../../services/user.service';
import { AuthHelper } from '../../../helpers/auth.helper';
import { ToastWrapper } from '../../../../utils/toast.wrapper';
import { AuthService } from '../../../../services/auth.service';
import { ConfirmModalComponent } from '../../../modals/confirm-modal/confirm-modal.component';
import { take } from 'rxjs';
import { BaseModalComponent } from '../../../base-component/modal/base-modal/base-modal.component';
import { DialogService } from 'primeng/dynamicdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
// TODO
@Component({
  selector: 'app-change-password-modal',
  imports: [ReactiveFormsModule, IconFieldModule, InputIconModule, InputTextModule, ButtonModule],
  templateUrl: './change-password-modal.component.html',
  styleUrl: './change-password-modal.component.css',
})
export class ChangePasswordModalComponent extends BaseModalComponent {
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly dialogService = inject(DialogService);
  protected readonly displayPasswordRequirements = signal(false);
  protected readonly oldPasswordFormControl = new FormControl('', [Validators.required]);
  protected readonly newPasswordFormControl = new FormControl('', this.passwordValidator());
  protected readonly confirmNewPasswordFormControl = new FormControl(
    '',
    this.confirmPasswordValidator(),
  );
  protected readonly form: FormGroup = new FormGroup({
    oldPassword: this.oldPasswordFormControl,
    newPassword: this.newPasswordFormControl,
    confirmNewPassword: this.confirmNewPasswordFormControl,
  });

  passwordValidator(): ValidatorFn {
    return (control: AbstractControl<string>): Record<string, unknown> | null => {
      const isValid = AuthHelper.checkPasswordFormat(control.value);
      return isValid ? null : { invalidPassword: { value: control.value } };
    };
  }

  confirmPasswordValidator(): ValidatorFn {
    return (control: AbstractControl<string>): Record<string, unknown> | null => {
      const password = control.root?.get('newPassword')?.value;
      if (password && control.value && control.value !== password) {
        return { passwordMismatch: { value: control.value } };
      }
      return null;
    };
  }

  async onSubmit() {
    this.dialogService
      .open(ConfirmModalComponent, {
        data: {
          title: 'Confirm Password Change',
          message:
            'Are you sure you want to change your password? This is not your master password.',
          confirmText: 'Confirm',
          cancelText: 'Cancel',
        },
        closable: true,
      })
      ?.onClose.pipe(take(1))
      .subscribe(async (confirmed: boolean) => {
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
    this.userService
      .changePassword$(this.oldPasswordFormControl.value!, this.newPasswordFormControl.value!)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.onPasswordChangeSuccess();
        },
        error: (error: Error) => {
          console.error('Error changing password:', error);
          ToastWrapper.error('Error changing password', error.message ?? error);
          this.stopLoading();
          throw error;
        },
      });
  }

  onPasswordChangeSuccess() {
    ToastWrapper.success('Password changed successfully');
    this.form.reset();
    this.authService
      .signout$()
      .pipe(take(1))
      .subscribe({
        next: () => {
          ToastWrapper.success('Signed out successfully');
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        },
        error: (error: Error) => {
          console.error('Signout error:', error);
          ToastWrapper.error('Signout error', error.message ?? error);
          this.stopLoading();
          throw error;
        },
      });
  }

  inputFocusOut() {
    this.displayPasswordRequirements.set(this.newPasswordFormControl.invalid);
  }

  keypress(event: KeyboardEvent) {
    if (this.form.valid && event.key === 'Enter') {
      event.stopImmediatePropagation();
      event.preventDefault();
      this.onSubmit();
    }
  }
}
