import { Component, inject } from '@angular/core';
import { BaseModalComponent } from '../../../base-component/modal/base-modal/base-modal.component';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { ConfirmModalComponent } from '../../../modals/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-edit-vault-modal',
  imports: [
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatDialogModule,
    ReactiveFormsModule
  ],
  templateUrl: './edit-vault-modal.component.html',
  styleUrl: './edit-vault-modal.component.css'
})
export class EditVaultModalComponent extends BaseModalComponent {

  private readonly vaultNameMaxLength = 128;
  data = inject(MAT_DIALOG_DATA);

  form = new FormGroup({
    vaultName: new FormControl(this.data.vaultName, [Validators.required, Validators.maxLength(this.vaultNameMaxLength)])
  });

  constructor(private dialog: MatDialog) {
    super(inject(MatDialogRef<EditVaultModalComponent>), inject(NgxSpinnerService));
  }

  onSubmit() {
    this.dialog.open(ConfirmModalComponent, {
      panelClass: 'custom-modal',
      data: {
        title: 'Confirm Vault Name Change',
        message: 'Are you sure you want to change the vault name?',
        confirmText: 'Confirm',
        cancelText: 'Cancel'
      }
    }).afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.dialogRef.close(this.data.vaultName === this.form.value.vaultName ? null : this.form.value.vaultName);
      } else {
        this.closeDialog();
      }
    })
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
