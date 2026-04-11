import { Component, computed, inject, signal } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { GeneratePasswordModalComponent } from '../generate-password-modal/generate-password-modal.component';
import { CryptoUtilsV1, EncryptionResult, uint8ArrayToBase64 } from '../../../../utils/crypto.utils';
import { VaultService } from '../../../../services/vault.service';
import { ToastWrapper } from '../../../../utils/toast.wrapper';
import { ConfirmModalComponent } from '../../../modals/confirm-modal/confirm-modal.component';
import { from, Observable, switchMap, take } from 'rxjs';
import { DecryptedData } from '../../../../entities/decrypted-data';
import { BaseModalComponent } from '../../../base-component/modal/base-modal/base-modal.component';
import { DialogService, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { CredentialService } from '../../../../services/credential.service';
import { Credential } from '../../../../entities/credential';
import { CreateCredentialDto } from '../../../../entities/create/create-credential-dto';
import { UpdateCredentialDto } from '../../../../entities/update/update-credential-dto';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-add-credential-modal',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    MessageModule
  ],
  templateUrl: './add-edit-credential-modal.component.html',
  styleUrl: './add-edit-credential-modal.component.css'
})
export class AddEditCredentialModalComponent extends BaseModalComponent {
  private readonly dialogService = inject(DialogService);
  private readonly vaultService = inject(VaultService);
  private readonly credentialService = inject(CredentialService);
  private readonly config = inject(DynamicDialogConfig);
  private readonly data = this.config.data as {
    mode: string;
    vaultId: string;
    credential?: Credential;
  };
  public static MODAL_MOD = {
    ADD: 'add',
    EDIT: 'edit'
  }
  protected readonly MODAL_MOD = AddEditCredentialModalComponent.MODAL_MOD;
  protected readonly credential: Credential | null = this.data.credential || null;
  protected readonly vaultId = this.data.vaultId;
  protected readonly mode = this.data.mode;
  protected readonly characterLimit = 2000;
  protected readonly passwordCharacterLimit = 10000;
  protected readonly notesCharacterCount = computed(() => this.credential?.decryptedData?.notes ? this.credential.decryptedData.notes.length : 0);
  protected readonly titleFormControl = new FormControl(this.credential?.decryptedData?.title, [Validators.required, Validators.maxLength(this.characterLimit)]);
  protected readonly identifierFormControl = new FormControl(this.credential?.decryptedData?.identifier, [Validators.maxLength(this.characterLimit)]);
  protected readonly passwordFormControl = new FormControl(this.credential?.decryptedData?.password, [Validators.maxLength(this.passwordCharacterLimit)]);
  protected readonly urlFormControl = new FormControl(this.credential?.decryptedData?.url, [Validators.maxLength(this.characterLimit)]);
  protected readonly notesFormControl = new FormControl(this.credential?.decryptedData?.notes, [Validators.maxLength(this.characterLimit)]);

  protected readonly form: FormGroup = new FormGroup({
    titleFormControl: this.titleFormControl,
    identifierFormControl: this.identifierFormControl,
    passwordFormControl: this.passwordFormControl,
    urlFormControl: this.urlFormControl,
    notesFormControl: this.notesFormControl
  });

  showPassword = true;

  constructor() {
    super();
    if (this.mode === AddEditCredentialModalComponent.MODAL_MOD.EDIT && !this.credential) {
      const msg = 'Edit mode requires a credential object';
      console.error(msg);
      ToastWrapper.error(msg, null);
      throw new Error(msg);
    }
    if (this.mode === AddEditCredentialModalComponent.MODAL_MOD.ADD && this.credential) {
      const msg = 'Add mode should not have a credential object';
      console.error(msg);
      ToastWrapper.error(msg, null);
      throw new Error(msg);
    }
    if (this.mode !== AddEditCredentialModalComponent.MODAL_MOD.ADD && this.mode !== AddEditCredentialModalComponent.MODAL_MOD.EDIT) {
      const msg = `Invalid mode: ${this.mode}. Expected 'add' or 'edit'.`;
      console.error(msg);
      ToastWrapper.error(msg, null);
      throw new Error(msg);
    }
  }

  async onSubmit() {
    console.log('Form submitted with data:', this.form.value);
    if (this.form.invalid) {
      console.error('Form is invalid:', this.form.errors);
      return;
    }
    const decryptedData: DecryptedData = DecryptedData.fromObject({
      title: this.titleFormControl.value!,
      identifier: this.identifierFormControl.value || '',
      password: this.passwordFormControl.value || '',
      url: this.urlFormControl.value || '',
      notes: this.notesFormControl.value || ''
    });
    const encryptionResult = await CryptoUtilsV1.encryptDataAsync(this.vaultService.getKey(), decryptedData.toString());
    if (this.mode === AddEditCredentialModalComponent.MODAL_MOD.ADD) {
      this.startLoading();
      this.createCredential$(encryptionResult).pipe(take(1)).subscribe({
        next: (credential: Credential) => {
          console.log('Credential created successfully:', credential);
          this.stopLoading();
          this.closeDialog(credential);
        },
        error: (error: any) => {
          this.displayError('Error creating credential', error);
          this.stopLoading();
        }
      });
    } else {
      const ref = this.dialogService.open(ConfirmModalComponent, {
        data: {
          title: `Edit Credential ${this.credential?.decryptedData?.title}`,
          message: `Are you sure you want to edit the credential "${this.credential?.decryptedData?.title}"?`,
          confirmText: 'Confirm',
          cancelText: 'Cancel',
          width: '400px',
          height: 'auto',
        }
      });
      ref?.onClose.pipe(take(1)).subscribe(async (confirmed: boolean) => {
        if (!confirmed) {
          return;
        }
        this.startLoading();
        this.editCredential$(encryptionResult).pipe(take(1)).subscribe({
          next: (updatedCredential: Credential) => {
            console.log('Credential updated successfully:', updatedCredential);
            ToastWrapper.success('Credential updated successfully');
            this.stopLoading();
            this.closeDialog(updatedCredential);
          },
          error: (error: any) => {
            this.displayError('Error updating credential', error);
            this.stopLoading();
          }
        });
      });
    }
  }

  createCredential$(encryptionResult: EncryptionResult): Observable<Credential> {
    const createCredentialDto: CreateCredentialDto = {
      vaultId: this.vaultId,
      encryptedDataBase64: uint8ArrayToBase64(encryptionResult.ciphertext),
      initializationVectorBase64: uint8ArrayToBase64(encryptionResult.initializationVector),
      encryptionVersion: encryptionResult.encryptionVersion,
      tagNames: []
    };

    return this.credentialService.createCredential$(createCredentialDto).pipe(
      switchMap((createdCredential: Credential) =>
        from(this.vaultService.decryptCredentialDataAsync(createdCredential))
      )
    );
  }

  editCredential$(encryptionResult: EncryptionResult): Observable<Credential> {
    this.credential!.encryptedData = encryptionResult.ciphertext;
    this.credential!.initializationVector = encryptionResult.initializationVector;
    this.credential!.encryptionVersion = encryptionResult.encryptionVersion;
    const updateCredentialDto: UpdateCredentialDto = UpdateCredentialDto.fromCredential(this.credential!);

    return this.credentialService.updateCredential$(updateCredentialDto).pipe(
      take(1),
      switchMap((updatedCredential: Credential) =>
        from(this.vaultService.decryptCredentialDataAsync(updatedCredential))
      )
    );
  }

  addEditTogglePasswordVisibility() {
    this.showPassword = !this.showPassword;
    const passwordField = document.querySelector<HTMLInputElement>('#add-edit-password');
    if (passwordField) {
      passwordField.type = passwordField.type === 'password' ? 'text' : 'password';
    }
  }

  generatePassword() {
    const ref = this.dialogService.open(GeneratePasswordModalComponent, {
      width: '800px',
      height: 'auto',
    });
    ref?.onClose.pipe(take(1)).subscribe((generatedPassword: string | null) => {
      console.log('Generated password:', generatedPassword);
      if (generatedPassword) {
        this.passwordFormControl.setValue(generatedPassword);
      }
    });
  }
}
