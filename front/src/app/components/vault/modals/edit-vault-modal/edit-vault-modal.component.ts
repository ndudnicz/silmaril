import { Component, inject } from '@angular/core';
import { BaseModalComponent } from '../../../base-component/modal/base-modal/base-modal.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { ConfirmModalComponent } from '../../../modals/confirm-modal/confirm-modal.component';
import { DialogService, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-edit-vault-modal',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule
  ],
  templateUrl: './edit-vault-modal.component.html',
  styleUrl: './edit-vault-modal.component.css'
})
export class EditVaultModalComponent extends BaseModalComponent {
  private readonly dialogService = inject(DialogService);
  private readonly vaultNameMaxLength = 128;
  private readonly config = inject(DynamicDialogConfig);
  protected readonly data = this.config.data as {
    vaultName: string;
  };

  form = new FormGroup({
    vaultName: new FormControl(this.data.vaultName, [Validators.required, Validators.maxLength(this.vaultNameMaxLength)])
  });

  onSubmit() {
    this.dialogService.open(ConfirmModalComponent, {
      data: {
        title: 'Confirm Vault Name Change',
        message: 'Are you sure you want to change the vault name?',
        confirmText: 'Confirm',
        cancelText: 'Cancel'
      }
    })?.onClose.subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.closeDialog(this.data.vaultName === this.form.value.vaultName ? null : this.form.value.vaultName);
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
