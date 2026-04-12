import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { VaultService } from '../../../../../services/vault.service';
import { ToastWrapper } from '../../../../../utils/toast.wrapper';
import { BaseModalComponent } from '../../../../base-component/modal/base-modal/base-modal.component';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-add-vault-modal',
  imports: [ReactiveFormsModule, FormsModule, ButtonModule, InputTextModule],
  templateUrl: './add-vault-modal.component.html',
  styleUrl: './add-vault-modal.component.css',
})
export class AddVaultModalComponent extends BaseModalComponent {
  private readonly vaultNameMaxLength = 128;
  private readonly vaultService = inject(VaultService);
  private readonly dialogRef = inject(DynamicDialogRef);

  vaultNameFormControl = new FormControl('', [
    Validators.required,
    Validators.maxLength(this.vaultNameMaxLength),
  ]);
  form: FormGroup = new FormGroup({
    vaultName: this.vaultNameFormControl,
  });

  onSubmit() {
    if (this.form.valid) {
      const vaultName = this.vaultNameFormControl.value;
      console.log('Creating vault with name:', vaultName);
      this.startLoading();
      this.vaultService
        .createVault$({
          name: vaultName!,
        })
        .subscribe({
          next: (vault) => {
            console.log('Vault created successfully:', vault);
            ToastWrapper.success('Vault created successfully');
            this.stopLoading();
            this.dialogRef.close(vault);
          },
          error: (error) => {
            this.displayError('Error creating vault', error);
            this.stopLoading();
          },
        });
    } else {
      console.error('Form is invalid:', this.form.errors);
    }
  }

  keypress(event: KeyboardEvent) {
    if (this.form.valid && event.key === 'Enter') {
      event.stopImmediatePropagation();
      event.preventDefault();
      this.onSubmit();
    }
  }
}
