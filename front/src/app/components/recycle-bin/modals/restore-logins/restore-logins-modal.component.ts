import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { BaseModalComponent } from '../../../base-component/modal/base-modal/base-modal.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { DataService } from '../../../../services/data.service';
import { Vault } from '../../../../entities/vault';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidatorFn } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { ConfirmModalComponent } from '../../../modals/confirm-modal/confirm-modal.component';
import { take } from 'rxjs';

@Component({
  selector: 'app-restore-logins-modal',
  imports: [
    MatIconModule,
    CommonModule,
    MatFormFieldModule,
    MatDialogModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatButtonModule
  ],
  templateUrl: './restore-logins-modal.component.html',
  styleUrl: './restore-logins-modal.component.css'
})
export class RestoreLoginsModalComponent extends BaseModalComponent {

  data = inject(MAT_DIALOG_DATA)
  vaults: Vault[] = [];
  displayVaultSelect = false;
  form = new FormGroup({
    vaultId: new FormControl('', [this.checkVaultRequirement()])
  });

  constructor(
    private dataService: DataService,
    private dialog: MatDialog
  ) {
    super(inject(MatDialogRef<RestoreLoginsModalComponent>), inject(NgxSpinnerService));
    this.vaults = this.dataService.getVaults();
    this.form.get('vaultId')?.setValue(this.vaults[0]?.id);
  }

  checkVaultRequirement(): ValidatorFn {
    return (control: AbstractControl<string>): { [key: string]: any } | null => {
      const isValid = this.data.orphanedLogins.length === 0;
      return isValid ? null : { 'vaultRequired': { value: control.value } };
    };
  }

  onSubmit() {
    this.dialog.open(ConfirmModalComponent, {
      panelClass: 'custom-modal',
      data: {
        title: 'Restore Deleted Logins',
        message: `Are you sure you want to restore ${this.data.orphanedLogins.length} deleted logins?`,
        confirmText: 'Restore',
        cancelText: 'Cancel'
      }
    }).afterClosed().pipe(take(1)).subscribe({
      next: () => {
        this.dialogRef.close(this.form.value.vaultId);
      },
      error: (error) => {
        this.displayError('Error while confirming restore logins', error);
      }
    });
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
