import { Component, inject } from '@angular/core';
import {
  FormGroup,
  FormControl,
  ReactiveFormsModule,
  Validators,
  ValidatorFn,
  AbstractControl,
} from '@angular/forms';
import { take } from 'rxjs';
import { BaseModalComponent } from '../../../base-component/modal/base-modal/base-modal.component';
import { ConfirmModalComponent } from '../../../modals/confirm-modal/confirm-modal.component';
import { DialogService } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MessageModule } from 'primeng/message';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-change-master-password-modal',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    MessageModule,
  ],
  templateUrl: './change-master-password-modal.component.html',
  styleUrl: './change-master-password-modal.component.css',
})
export class ChangeMasterPasswordModalComponent extends BaseModalComponent {
  private readonly dialogService = inject(DialogService);
  protected readonly minPasswordLength = 8;
  protected readonly newMasterPasswordFormControl = new FormControl('', [
    Validators.minLength(this.minPasswordLength),
  ]);
  protected readonly confirmNewMasterPasswordFormControl = new FormControl(
    '',
    this.confirmPasswordValidator(),
  );
  protected readonly form: FormGroup = new FormGroup({
    newMasterPassword: this.newMasterPasswordFormControl,
    confirmNewMasterPassword: this.confirmNewMasterPasswordFormControl,
  });

  confirmPasswordValidator(): ValidatorFn {
    return (control: AbstractControl<string>): Record<string, unknown> | null => {
      const password = control.root?.get('newMasterPassword')?.value;
      if (password && control.value && control.value !== password) {
        return { passwordMismatch: { value: control.value } };
      }
      return null;
    };
  }

  onSubmit() {
    console.log('Form submitted:', this.form.value);
    this.dialogService
      .open(ConfirmModalComponent, {
        closable: true,

        data: {
          title: 'Change Master Password',
          message:
            'Are you sure you want to change your master password? This will reencrypt all your vaults with the new master password.',
          confirmText: 'Confirm',
          cancelText: 'Cancel',
        },
      })
      ?.onClose.pipe(take(1))
      .subscribe(async (confirmed) => {
        if (confirmed) {
          this.closeDialog(confirmed ? this.form.value.newMasterPassword : null);
        }
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
