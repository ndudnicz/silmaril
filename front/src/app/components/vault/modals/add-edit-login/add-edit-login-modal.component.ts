import { Component, inject } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { GeneratePasswordModalComponent } from '../generate-password-modal/generate-password-modal.component';
import { CreateLoginDto, DecryptedData, Login, UpdateLoginDto } from '../../../../entities/login';
import { CryptoUtilsV1, EncryptionResult, uint8ArrayToBase64 } from '../../../../utils/crypto.utils';
import { VaultService } from '../../../../services/vault.service';
import { LoginService } from '../../../../services/login.service';
import { ToastWrapper } from '../../../../utils/toast.wrapper';
import { ConfirmModalComponent } from '../../../modals/confirm-modal/confirm-modal.component';
import { BaseComponent } from '../../../base-component/base-component.component';
import { from, Observable, switchMap, take } from 'rxjs';

@Component({

  selector: 'app-add-login-modal',
  imports: [
    MatDialogModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule
  ],
  templateUrl: './add-edit-login-modal.component.html',
  styleUrl: './add-edit-login-modal.component.css'
})
export class AddEditLoginModalComponent extends BaseComponent {
  data = inject(MAT_DIALOG_DATA);
  public static MODAL_MOD = {
    ADD: 'add',
    EDIT: 'edit'
  }
  MODAL_MOD = AddEditLoginModalComponent.MODAL_MOD;
  login: Login | null = this.data.login || null;
  mode = this.data.mode;
  characterLimit = 2000;
  passwordCharacterLimit = 10000;
  notesCharacterCount = this.login?.decryptedData?.notes ? this.login.decryptedData.notes.length : 0;
  titleFormControl = new FormControl(this.login?.decryptedData?.title, [Validators.required, Validators.maxLength(this.characterLimit)]);
  identifierFormControl = new FormControl(this.login?.decryptedData?.identifier, [Validators.maxLength(this.characterLimit)]);
  passwordFormControl = new FormControl(this.login?.decryptedData?.password, [Validators.maxLength(this.passwordCharacterLimit)]);
  urlFormControl = new FormControl(this.login?.decryptedData?.url, [Validators.maxLength(this.characterLimit)]);
  notesFormControl = new FormControl(this.login?.decryptedData?.notes, [Validators.maxLength(this.characterLimit)]);

  form: FormGroup = new FormGroup({
    titleFormControl: this.titleFormControl,
    identifierFormControl: this.identifierFormControl,
    passwordFormControl: this.passwordFormControl,
    urlFormControl: this.urlFormControl,
    notesFormControl: this.notesFormControl
  });

  showPassword = true;

  constructor(
    private vaultService: VaultService,
    private loginService: LoginService,
    private dialogRef: MatDialogRef<AddEditLoginModalComponent>,
    private dialog: MatDialog
  ) {
    super(inject(NgxSpinnerService));
    if (this.mode === AddEditLoginModalComponent.MODAL_MOD.EDIT && !this.login) {
      const msg = 'Edit mode requires a login object';
      console.error(msg);
      ToastWrapper.error(msg, null);
      throw new Error(msg);
    }
    if (this.mode === AddEditLoginModalComponent.MODAL_MOD.ADD && this.login) {
      const msg = 'Add mode should not have a login object';
      console.error(msg);
      ToastWrapper.error(msg, null);
      throw new Error(msg);
    }
    if (this.mode !== AddEditLoginModalComponent.MODAL_MOD.ADD && this.mode !== AddEditLoginModalComponent.MODAL_MOD.EDIT) {
      const msg = `Invalid mode: ${this.mode}. Expected 'add' or 'edit'.`;
      console.error(msg);
      ToastWrapper.error(msg, null);
      throw new Error(msg);
    }
    this.notesFormControl.valueChanges.subscribe(value => {
      this.notesCharacterCount = value ? value.length : 0;
    });
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
    if (this.mode === AddEditLoginModalComponent.MODAL_MOD.ADD) {
      this.startLoading();
      this.createLogin(encryptionResult).pipe(take(1)).subscribe({
        next: (login: Login) => {
          console.log('Login created successfully:', login);
          this.stopLoading();
          this.dialogRef.close(login);
        },
        error: (error: any) => {
          this.displayError('Error creating login', error);
          this.stopLoading();
        }
      });
    } else {
      this.dialog.open(ConfirmModalComponent, {
        panelClass: 'custom-modal',
        data: {
          title: `Edit Login ${this.login?.decryptedData?.title}`,
          message: `Are you sure you want to edit the login "${this.login?.decryptedData?.title}"?`,
          confirmText: 'Confirm',
          cancelText: 'Cancel',
          width: '400px',
          height: 'auto',
          closeOnNavigation: false,
          disableClose: true,
          autoFocus: true
        }
      }).afterClosed().pipe(take(1)).subscribe(async (confirmed: boolean) => {
        if (!confirmed) {
          return;
        }
        this.startLoading();
        this.editLogin(encryptionResult).pipe(take(1)).subscribe({
          next: (updatedLogin: Login) => {
            console.log('Login updated successfully:', updatedLogin);
            ToastWrapper.success('Login updated successfully');
            this.stopLoading();
            this.dialogRef.close(updatedLogin);
          },
          error: (error: any) => {
            this.displayError('Error updating login', error);
            this.stopLoading();
          }
        });
      });
    }
  }

  createLogin(encryptionResult: EncryptionResult): Observable<Login> {
    const createLoginDto: CreateLoginDto = {
      encryptedDataBase64: uint8ArrayToBase64(encryptionResult.ciphertext),
      initializationVectorBase64: uint8ArrayToBase64(encryptionResult.initializationVector),
      encryptionVersion: encryptionResult.encryptionVersion,
      tagNames: []
    };

    return this.loginService.createLogin$(createLoginDto).pipe(
      switchMap((createdLogin: Login) =>
        from(this.vaultService.decryptLoginDataAsync(createdLogin))
      )
    );
  }

  editLogin(encryptionResult: EncryptionResult): Observable<Login> {
    this.login!.encryptedData = encryptionResult.ciphertext;
    this.login!.initializationVector = encryptionResult.initializationVector;
    this.login!.encryptionVersion = encryptionResult.encryptionVersion;
    const updateLoginDto: UpdateLoginDto = UpdateLoginDto.fromLogin(this.login!);

    return this.loginService.updateLogin$(updateLoginDto).pipe(
      take(1),
      switchMap((updatedLogin: Login) =>
        from(this.vaultService.decryptLoginDataAsync(updatedLogin))
      )
    );
  }

  closeDialog() {
    this.dialogRef.close();
  }

  addEditTogglePasswordVisibility() {
    this.showPassword = !this.showPassword;
    const passwordField = document.querySelector<HTMLInputElement>('#add-edit-password');
    if (passwordField) {
      passwordField.type = passwordField.type === 'password' ? 'text' : 'password';
    }
  }

  generatePassword() {
    this.dialog.open(GeneratePasswordModalComponent, {
      panelClass: 'custom-modal',
      width: '800px',
      height: 'auto',
      closeOnNavigation: false,
      disableClose: true,
    }).afterClosed().pipe(take(1)).subscribe((generatedPassword: string | null) => {
      console.log('Generated password:', generatedPassword);
      if (generatedPassword) {
        this.passwordFormControl.setValue(generatedPassword);
      }
    });
  }
}
