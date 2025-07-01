import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { FormGroup, FormControl, ReactiveFormsModule, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ConfirmModalComponent } from '../../../modals/confirm-modal/confirm-modal.component';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-change-master-password-modal',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    CommonModule,
    MatInputModule
  ],
  templateUrl: './change-master-password-modal.component.html',
  styleUrl: './change-master-password-modal.component.css'
})
export class ChangeMasterPasswordModalComponent {
  loading = false;
  minPasswordLength = 8;
  newMasterPasswordFormControl = new FormControl('', [Validators.minLength(this.minPasswordLength)]);
  confirmNewMasterPasswordFormControl = new FormControl('', this.confirmPasswordValidator());
  form: FormGroup = new FormGroup({
    newMasterPassword: this.newMasterPasswordFormControl,
    confirmNewMasterPassword: this.confirmNewMasterPasswordFormControl
  });

  constructor(
    private dialogRef: MatDialogRef<ChangeMasterPasswordModalComponent>,
    private dialog: MatDialog
  ) {
    // Initialization logic can go here
  }

  confirmPasswordValidator(): ValidatorFn {
    return (control: AbstractControl<string>): { [key: string]: any } | null => {
      let password = control.root?.get('newMasterPassword')?.value;
      if (password && control.value && control.value !== password) {
        return { 'passwordMismatch': { value: control.value } };
      }
      return null;
    };
  }

  onSubmit() {
    // Logic to handle form submission, e.g., changing the master password
    console.log('Form submitted:', this.form.value);
    this.dialog.open(ConfirmModalComponent, {
      data: {
        title: 'Change Master Password',
        message: 'Are you sure you want to change your master password? This will reencrypt your vault with the new master password.',
        confirmText: 'Confirm',
        cancelText: 'Cancel'
      },
      panelClass: 'custom-modal'
    }).afterClosed().subscribe(async confirmed => {
      if (confirmed) {
        this.dialogRef.close(confirmed ? this.form.value.newMasterPassword : null);
      }
    })
  }

  closeDialog() {
    // Logic to close the dialog
    console.log('Dialog closed');
    this.dialogRef.close(null);
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
