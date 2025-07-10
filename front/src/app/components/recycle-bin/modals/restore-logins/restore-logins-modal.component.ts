import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { BaseModalComponent } from '../../../base-component/modal/base-modal/base-modal.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { DataService } from '../../../../services/data.service';
import { Vault } from '../../../../entities/vault';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidatorFn } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-restore-logins-modal',
  imports: [
    MatIconModule,
    CommonModule,
    MatFormFieldModule,
    MatDialogModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatSelectModule
  ],
  templateUrl: './restore-logins-modal.component.html',
  styleUrl: './restore-logins-modal.component.css'
})
export class RestoreLoginsModalComponent extends BaseModalComponent {

  data = inject(MAT_DIALOG_DATA)
  vaults: Vault[] = [];
  displayVaultSelect = false;
  form = new FormGroup({
    vaultId: new FormControl('', [])
  });

  constructor(
    private dataService: DataService
  ) {
    super(inject(MatDialogRef<RestoreLoginsModalComponent>), inject(NgxSpinnerService));
    this.vaults = this.dataService.getVaults();
  }

  checkVaultRequirement(): ValidatorFn {
    return (control: AbstractControl<string>): { [key: string]: any } | null => {
      const isValid = this.data.orphanedLogins.length === 0;
      return isValid ? null : { 'vaultRequired': { value: control.value } };
    };
  }

  onSubmit() {

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
