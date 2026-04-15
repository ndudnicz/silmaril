import { Component, computed, inject } from '@angular/core';
import { BaseModalComponent } from '../../../base-component/modal/base-modal/base-modal.component';
import { DataService } from '../../../../services/data.service';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidatorFn,
} from '@angular/forms';
import { ConfirmModalComponent } from '../../../modals/confirm-modal/confirm-modal.component';
import { take } from 'rxjs';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';

export interface RestoreLoginsModalData {
  orphanedLogins: Credential[];
}

@Component({
  selector: 'app-restore-logins-modal',
  imports: [ReactiveFormsModule, FormsModule, SelectModule, ButtonModule],
  templateUrl: './restore-logins-modal.component.html',
  styleUrl: './restore-logins-modal.component.css',
})
export class RestoreLoginsModalComponent extends BaseModalComponent {
  private readonly config = inject(DynamicDialogConfig);
  private readonly dialogRef = inject(DynamicDialogRef);
  protected readonly data = this.config.data as RestoreLoginsModalData;
  protected readonly dialogService = inject(DialogService);
  protected readonly dataService = inject(DataService);
  protected readonly vaults = computed(() => this.dataService.getVaults());
  protected readonly displayVaultSelect = false;
  protected readonly form = new FormGroup({
    vaultId: new FormControl(this.vaults()[0].id, []),
  });

  checkVaultRequirement(): ValidatorFn {
    return (control: AbstractControl<string>): Record<string, unknown> | null => {
      const isValid = this.data.orphanedLogins.length === 0;
      return isValid ? null : { vaultRequired: { value: control.value } };
    };
  }

  onSubmit() {
    this.dialogService
      .open(ConfirmModalComponent, {
        header: 'Confirm restore logins',
        closable: true,
        data: {
          title: 'Restore deleted logins',
          message: `Are you sure you want to restore ${this.data.orphanedLogins.length} deleted logins?`,
          confirmText: 'Restore',
          cancelText: 'Cancel',
        },
      })
      ?.onClose.pipe(take(1))
      .subscribe({
        next: () => {
          this.dialogRef.close(this.form.value.vaultId);
        },
        error: (error) => {
          this.displayError('Error while confirming restore logins', error);
        },
      });
  }

  keypress(event: KeyboardEvent) {
    if (this.form.valid && event.key === 'Enter') {
      event.stopImmediatePropagation();
      event.preventDefault();
      this.onSubmit();
    }
  }
}
