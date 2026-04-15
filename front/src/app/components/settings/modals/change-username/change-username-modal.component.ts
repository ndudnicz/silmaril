import { Component, inject } from '@angular/core';
import { ConfirmModalComponent } from '../../../modals/confirm-modal/confirm-modal.component';
import { UserService } from '../../../../services/user.service';
import { ToastWrapper } from '../../../../utils/toast.wrapper';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { take } from 'rxjs';
import { BaseModalComponent } from '../../../base-component/modal/base-modal/base-modal.component';
import { DialogService } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-change-username-modal',
  imports: [ReactiveFormsModule, IconFieldModule, InputIconModule, InputTextModule, ButtonModule],
  templateUrl: './change-username-modal.component.html',
  styleUrl: './change-username-modal.component.css',
})
export class ChangeUsernameModalComponent extends BaseModalComponent {
  private readonly dialogService = inject(DialogService);
  private readonly userService = inject(UserService);
  protected readonly userNameFormControl = new FormControl('', [Validators.required]);
  protected readonly form: FormGroup = new FormGroup({
    username: this.userNameFormControl,
  });

  async onSubmit() {
    this.dialogService
      .open(ConfirmModalComponent, {
        header: 'Confirm username change',
        closable: false,
        data: {
          message: 'Are you sure you want to change username?',
          confirmText: 'Confirm',
          cancelText: 'Cancel',
        },
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
      .updateUser$({
        username: this.userNameFormControl.value!,
      })
      .pipe(take(1))
      .subscribe({
        next: async (updatedUser) => {
          console.log('Username updated successfully:', updatedUser);
          this.onUsernameChangeSuccess();
        },
        error: (error: any) => {
          console.error('Error updating username:', error);
          const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
          ToastWrapper.error('Failed to change username', errorMessage);
          this.stopLoading();
        },
      });
  }

  onUsernameChangeSuccess() {
    ToastWrapper.success('Username changed successfully');
    this.form.reset();
    this.stopLoading();
    this.closeDialog();
  }

  keypress(event: KeyboardEvent) {
    if (this.form.valid && event.key === 'Enter') {
      event.stopImmediatePropagation();
      event.preventDefault();
      this.onSubmit();
    }
  }
}
