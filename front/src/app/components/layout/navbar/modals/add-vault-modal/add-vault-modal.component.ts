import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { VaultService } from '../../../../../services/vault.service';
import { ToastWrapper } from '../../../../../utils/toast.wrapper';
import { BaseModalComponent } from '../../../../base-component/modal/base-modal/base-modal.component';

@Component({
  selector: 'app-add-vault-modal',
  imports: [
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatIconModule,
    MatDialogModule
  ],
  templateUrl: './add-vault-modal.component.html',
  styleUrl: './add-vault-modal.component.css'
})
export class AddVaultModalComponent extends BaseModalComponent {
  private readonly vaultNameMaxLength = 128;

  vaultNameFormControl = new FormControl('', [
    Validators.required,
    Validators.maxLength(this.vaultNameMaxLength)
  ]);
  form: FormGroup = new FormGroup({
    vaultName: this.vaultNameFormControl
  });

  constructor(
    private vaultService: VaultService
  ) {
    super(inject(MatDialogRef<AddVaultModalComponent>), inject(NgxSpinnerService));
  }

  onSubmit() {
    if (this.form.valid) {
      const vaultName = this.vaultNameFormControl.value;
      console.log('Creating vault with name:', vaultName);
      this.startLoading();
      this.vaultService.createVault$({
        name: vaultName!
      }).subscribe({
        next: (vault) => {
          console.log('Vault created successfully:', vault);
          ToastWrapper.success('Vault created successfully');
          this.stopLoading();
          this.dialogRef.close(vault);
        },
        error: (error) => {
          this.displayError('Error creating vault', error);
          this.stopLoading();
        }
      });
    } else {
      console.error('Form is invalid:', this.form.errors);
    }
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
