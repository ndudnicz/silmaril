import { Component, inject, OnInit, signal } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { GeneratePasswordModalComponent } from '../generate-password-modal/generate-password-modal.component';
import {
  CryptoUtilsV1,
  EncryptionResult,
  uint8ArrayToBase64,
} from '../../../../utils/crypto.utils';
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
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { IftaLabelModule } from 'primeng/iftalabel';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-add-credential-modal',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    MessageModule,
    IftaLabelModule,
    CommonModule,
    TextareaModule,
  ],
  templateUrl: './add-edit-credential-modal.component.html',
})
export class AddEditCredentialModalComponent extends BaseModalComponent implements OnInit {
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
    EDIT: 'edit',
  };
  protected readonly MODAL_MOD = AddEditCredentialModalComponent.MODAL_MOD;
  protected readonly credential: Credential | null = this.data.credential ?? null;
  protected readonly vaultId = this.data.vaultId;
  protected readonly mode = this.data.mode;
  protected readonly characterLimit = 2000;
  protected readonly passwordCharacterLimit = 10000;
  protected notesCharacterCount = signal(0);
  protected readonly titleFormControl = new FormControl(this.credential?.decryptedData?.title, [
    Validators.required,
    Validators.maxLength(this.characterLimit),
  ]);
  protected readonly identifierFormControl = new FormControl(
    this.credential?.decryptedData?.identifier,
    [Validators.maxLength(this.characterLimit)],
  );
  protected readonly passwordFormControl = new FormControl(
    this.credential?.decryptedData?.password,
    [Validators.maxLength(this.passwordCharacterLimit)],
  );
  protected readonly urlFormControl = new FormControl(this.credential?.decryptedData?.url, [
    Validators.maxLength(this.characterLimit),
  ]);
  protected readonly notesFormControl = new FormControl(this.credential?.decryptedData?.notes, [
    Validators.maxLength(this.characterLimit),
  ]);

  protected readonly form: FormGroup = new FormGroup({
    titleFormControl: this.titleFormControl,
    identifierFormControl: this.identifierFormControl,
    passwordFormControl: this.passwordFormControl,
    urlFormControl: this.urlFormControl,
    notesFormControl: this.notesFormControl,
  });

  showPassword = signal(false);

  constructor() {
    super();
    // if (this.mode === AddEditCredentialModalComponent.MODAL_MOD.EDIT && !this.credential) {
    //   const msg = 'Edit mode requires a credential object';
    //   console.error(msg);
    //   ToastWrapper.error(msg, null);
    //   throw new Error(msg);
    // }
    // if (this.mode === AddEditCredentialModalComponent.MODAL_MOD.ADD && this.credential) {
    //   const msg = 'Add mode should not have a credential object';
    //   console.error(msg);
    //   ToastWrapper.error(msg, null);
    //   throw new Error(msg);
    // }
    if (
      this.mode !== AddEditCredentialModalComponent.MODAL_MOD.ADD &&
      this.mode !== AddEditCredentialModalComponent.MODAL_MOD.EDIT
    ) {
      const msg = `Invalid mode: ${this.mode}. Expected 'add' or 'edit'.`;
      console.error(msg);
      ToastWrapper.error(msg, null);
      throw new Error(msg);
    }

    // this.noteChanged();
  }

  ngOnInit(): void {
    this.initFormControls();
  }

  private initFormControls() {
    console.log('initFormControls called with credential:', this.credential);

    this.titleFormControl.setValue(this.credential?.decryptedData?.title ?? '');
    this.identifierFormControl.setValue(this.credential?.decryptedData?.identifier ?? '');
    this.passwordFormControl.setValue(this.credential?.decryptedData?.password ?? '');
    this.urlFormControl.setValue(this.credential?.decryptedData?.url ?? '');
    this.notesFormControl.setValue(this.credential?.decryptedData?.notes ?? '');
    this.noteChanged();
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
      notes: this.notesFormControl.value || '',
    });
    const encryptionResult = await CryptoUtilsV1.encryptDataAsync(
      this.vaultService.getKey(),
      decryptedData.toString(),
    );
    if (this.mode === AddEditCredentialModalComponent.MODAL_MOD.ADD) {
      this.startLoading();
      this.createCredential$(encryptionResult)
        .pipe(take(1))
        .subscribe({
          next: (credential: Credential) => {
            console.log('Credential created successfully:', credential);
            this.stopLoading();
            this.closeDialog(credential);
          },
          error: (error: unknown) => {
            this.displayError('Error creating credential', error);
            this.stopLoading();
          },
        });
    } else {
      this.dialogService
        .open(ConfirmModalComponent, {
          header: `Edit Credential ${this.credential?.decryptedData?.title}`,
          closable: false,
          width: 'auto',
          height: 'auto',
          data: {
            message: `Are you sure you want to edit the credential "${this.credential?.decryptedData?.title}"?`,
            confirmText: 'Confirm',
            cancelText: 'Cancel',
          },
        })
        ?.onClose.pipe(take(1))
        .subscribe((confirmed: boolean) => {
          if (!confirmed) {
            return;
          }
          this.startLoading();
          this.editCredential$(encryptionResult)
            .pipe(take(1))
            .subscribe({
              next: (updatedCredential: Credential) => {
                console.log('Credential updated successfully:', updatedCredential);
                ToastWrapper.success('Credential updated successfully');
                this.stopLoading();
                this.closeDialog(updatedCredential);
              },
              error: (error: unknown) => {
                this.displayError('Error updating credential', error);
                this.stopLoading();
              },
            });
        });
    }
  }

  noteChanged() {
    const notesValue = this.notesFormControl.value ?? '';
    this.notesCharacterCount.set(notesValue.length);
  }

  createCredential$(encryptionResult: EncryptionResult): Observable<Credential> {
    const createCredentialDto: CreateCredentialDto = {
      vaultId: this.vaultId,
      encryptedDataBase64: uint8ArrayToBase64(encryptionResult.ciphertext),
      initializationVectorBase64: uint8ArrayToBase64(encryptionResult.initializationVector),
      encryptionVersion: encryptionResult.encryptionVersion,
      tagNames: [],
    };

    return this.credentialService
      .createCredential$(createCredentialDto)
      .pipe(
        take(1),
        switchMap((createdCredential: Credential) =>
          this.vaultService.decryptCredentialData$(createdCredential)
        ),
      );
  }

  editCredential$(encryptionResult: EncryptionResult): Observable<Credential> {
    this.credential!.encryptedData = encryptionResult.ciphertext;
    this.credential!.initializationVector = encryptionResult.initializationVector;
    this.credential!.encryptionVersion = encryptionResult.encryptionVersion;
    const updateCredentialDto: UpdateCredentialDto = UpdateCredentialDto.fromCredential(
      this.credential!,
    );

    return this.credentialService.updateCredential$(updateCredentialDto).pipe(
      take(1),
      switchMap((updatedCredential: Credential) =>
        from(this.vaultService.decryptCredentialData$(updatedCredential)),
      ),
    );
  }

  addEditTogglePasswordVisibility() {
    this.showPassword.set(!this.showPassword());
    const passwordField = document.querySelector<HTMLInputElement>('#add-edit-password');
    if (passwordField) {
      passwordField.type = passwordField.type === 'password' ? 'text' : 'password';
    }
  }

  generatePassword() {
    this.dialogService
      .open(GeneratePasswordModalComponent, {
        closable: true,
        header: 'Password Generator',
        width: '800px',
        height: 'auto',
      })
      ?.onClose.pipe(take(1))
      .subscribe((generatedPassword: string | null) => {
        console.log('Generated password:', generatedPassword);
        if (generatedPassword) {
          this.passwordFormControl.setValue(generatedPassword);
        }
      });
  }
}
