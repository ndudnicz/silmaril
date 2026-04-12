import { Component, computed, inject, model, output, signal } from '@angular/core';
import { Credential } from '../../../entities/credential';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { ToastWrapper } from '../../../utils/toast.wrapper';
import { ConfirmModalComponent } from '../../modals/confirm-modal/confirm-modal.component';
import { CredentialService } from '../../../services/credential.service';
import { BaseComponent } from '../../base-component/base-component.component';
import { take } from 'rxjs';
import { UpdateCredentialDto } from '../../../entities/update/update-credential-dto';
import { DialogService } from 'primeng/dynamicdialog';
import { AddEditCredentialModalComponent } from '../modals/add-edit-credential/add-edit-credential-modal.component';
import { InputTextModule } from 'primeng/inputtext';
import { IftaLabelModule } from 'primeng/iftalabel';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-selected-credential',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    ClipboardModule,
    InputTextModule,
    IftaLabelModule,
    ButtonModule,
  ],
  templateUrl: './selected-credential.component.html',
  styleUrl: './selected-credential.component.css',
})
export class SelectedCredentialComponent extends BaseComponent {
  readonly credential = model<Credential | null>();
  protected readonly updateCredential = output<Credential>();
  private readonly credentialService = inject(CredentialService);
  private readonly dialogService = inject(DialogService);
  protected readonly showPassword = signal(false);
  protected readonly title = computed(() => this.credential()?.decryptedData?.title || '');
  protected readonly identifier = computed(
    () => this.credential()?.decryptedData?.identifier || '',
  );
  protected readonly password = computed(() => this.credential()?.decryptedData?.password || '');
  protected readonly url = computed(() => this.credential()?.decryptedData?.url || '');
  protected readonly notes = computed(() => this.credential()?.decryptedData?.notes || '');

  close() {
    this.credential.set(null);
  }

  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
    const passwordField = document.querySelector<HTMLInputElement>('#selected-login-password');
    if (passwordField) {
      passwordField.type = passwordField.type === 'password' ? 'text' : 'password';
    }
  }

  openEditModal(): void {
    const credential = this.credential();
    if (!credential) {
      this.displayError('No credential selected', null);
      return;
    }
    this.dialogService
      .open(AddEditCredentialModalComponent, {
        closable: true,

        width: '600px',
        height: 'auto',
        data: {
          mode: AddEditCredentialModalComponent.MODAL_MOD.EDIT,
          login: credential,
          vaultId: credential.vaultId,
        },
      })
      ?.onClose.pipe(take(1))
      .subscribe((result: Credential) => {
        if (result) {
          this.credential.set(result);
          this.updateCredential.emit(result);
        }
      });
  }

  openSoftDeleteModal(): void {
    const credential = this.credential();
    if (!credential) {
      this.displayError('No credential selected', null);
      return;
    }
    this.dialogService
      .open(ConfirmModalComponent, {
        closable: true,

        width: '400px',
        height: 'auto',
        data: {
          title: `Delete Login ${credential.decryptedData?.title}`,
          message: `Are you sure you want to delete the login "${credential.decryptedData?.title}"? It will be sent to the recycle bin and can be restored later.`,
          confirmText: 'Confirm',
          cancelText: 'Cancel',
        },
      })
      ?.onClose.pipe(take(1))
      .subscribe((confirmed: boolean): void => {
        if (confirmed) {
          this.startLoading();
          this.credential.set({ ...this.credential(), deleted: true } as Credential);
          this.credentialService
            .updateCredential$(UpdateCredentialDto.fromCredential(this.credential()!))
            .pipe(take(1))
            .subscribe({
              next: (updatedLogin: Credential) => this.onSoftDeleteLoginSuccess(updatedLogin),
              error: (error: Error) => {
                this.displayError('Error deleting login', error);
                this.stopLoading();
              },
            });
        }
      });
  }

  onSoftDeleteLoginSuccess(updatedLogin: Credential): void {
    console.log('Login soft deleted successfully:', updatedLogin);
    this.updateCredential.emit(updatedLogin);
    ToastWrapper.success('Login deleted successfully');
    this.stopLoading();
  }

  selectInputText(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    inputElement.readOnly = false;
    inputElement.select();
    setTimeout(() => {
      inputElement.readOnly = true;
    }, 0);
    ToastWrapper.info('Value copied to clipboard');
  }
}
