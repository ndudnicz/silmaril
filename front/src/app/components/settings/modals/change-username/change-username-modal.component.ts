import { Component, inject } from '@angular/core';
import { ConfirmModalComponent } from '../../../modals/confirm-modal/confirm-modal.component';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { UserService } from '../../../../services/user.service';
import { ToastWrapper } from '../../../../utils/toast.wrapper';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { take } from 'rxjs';
import { BaseModalComponent } from '../../../base-component/modal/base-modal/base-modal.component';

@Component({
  selector: 'app-change-username-modal',
  imports: [
    MatDialogModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
  ],
  templateUrl: './change-username-modal.component.html',
  styleUrl: './change-username-modal.component.css'
})
export class ChangeUsernameModalComponent extends BaseModalComponent {
  userNameFormControl = new FormControl('', [Validators.required]);
  form: FormGroup = new FormGroup({
    username: this.userNameFormControl
  });

  constructor(
    private dialog: MatDialog,
    private userService: UserService
  ) {
    super(inject(MatDialogRef<ChangeUsernameModalComponent>), inject(NgxSpinnerService));
  }

  async onSubmit() {
    this.dialog.open(ConfirmModalComponent, {
      panelClass: 'custom-modal',
      data: {
        title: 'Confirm Username Change',
        message: 'Are you sure you want to change username?',
        confirmText: 'Confirm',
        cancelText: 'Cancel'
      }
    }).afterClosed().pipe(take(1)).subscribe(async (confirmed: boolean) => {
      console.log('Confirm modal closed with confirmation:', confirmed);
      if (confirmed) {
        await this.saveSettings();
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
    this.userService.updateUser$({
      username: this.userNameFormControl.value!
    }).pipe(take(1)).subscribe({
      next: async (updatedUser) => {
        console.log('Username updated successfully:', updatedUser);
        this.onUsernameChangeSuccess();
      },
      error: (error: any) => {
        console.error('Error updating username:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        ToastWrapper.error('Failed to change username', errorMessage);
        this.stopLoading();
      }
    });
  }

  onUsernameChangeSuccess() {
    ToastWrapper.success('Username changed successfully');
    this.form.reset();
    this.stopLoading();
    this.closeDialog();
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
