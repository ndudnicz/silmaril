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
export class AddEditLoginModalComponent {
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

  loading = false;
  showPassword = false;

  constructor(
    private spinner: NgxSpinnerService,
    private vaultService: VaultService,
    private loginService: LoginService,
    private dialogRef: MatDialogRef<AddEditLoginModalComponent>,
    private dialog: MatDialog
  ) {
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
    try {
      if (this.mode === AddEditLoginModalComponent.MODAL_MOD.ADD) {
        this.loading = true;
        this.spinner.show();
        const login: Login = await this.createLogin(encryptionResult);
        ToastWrapper.success('Login created successfully')
        this.dialogRef.close(login);
      } else {
        this.dialog.open(ConfirmModalComponent, {
          panelClass: 'custom-modal',
          data: {
            title: `Edit Login ${this.login?.decryptedData?.title}`,
            message: `Are you sure you want to edit the login "${this.login?.decryptedData?.title}"?`,
            confirmText: 'Edit',
            cancelText: 'Cancel',
            width: '400px',
            height: 'auto',
            closeOnNavigation: false,
            disableClose: true,
            autoFocus: true
          }
        }).afterClosed().subscribe(async (confirmed: boolean) => {
          if (!confirmed) {
            return;
          }
          this.loading = true;
          this.spinner.show();
          const updatedLogin: Login = await this.editLogin(encryptionResult);
          ToastWrapper.success('Login updated successfully');
          this.loading = false;
          this.spinner.hide();
          this.dialogRef.close(updatedLogin);
        });
      }
    } catch (error: any) {
      console.error('Error during form submission:', error);
      ToastWrapper.error('Failed to process login: ', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      this.spinner.hide();
      this.loading = false;
    }
  }

  async createLogin(encryptionResult: EncryptionResult): Promise<Login> {
    const createLoginDto: CreateLoginDto = {
      encryptedDataBase64: uint8ArrayToBase64(encryptionResult.ciphertext),
      initializationVectorBase64: uint8ArrayToBase64(encryptionResult.initializationVector),
      encryptionVersion: encryptionResult.encryptionVersion,
      tagNames: []
    };
    try {
      let login: Login = await this.loginService.createLoginAsync(createLoginDto);
      return await this.vaultService.decryptLoginDataAsync(login);
    } catch (error: any) {
      throw new Error('Failed to create login: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async editLogin(encryptionResult: EncryptionResult): Promise<Login> {
    this.login!.encryptedData = encryptionResult.ciphertext;
    this.login!.initializationVector = encryptionResult.initializationVector;
    this.login!.encryptionVersion = encryptionResult.encryptionVersion;
    const updateLoginDto: UpdateLoginDto = UpdateLoginDto.fromLogin(this.login!);
    try {
      let updatedLogin: Login = await this.loginService.updateLoginAsync(updateLoginDto);
      return await this.vaultService.decryptLoginDataAsync(updatedLogin);
    } catch (error: any) {
      throw new Error('Failed to update login: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
    const passwordField = document.querySelector<HTMLInputElement>('#password');
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
    }).afterClosed().subscribe((generatedPassword: string | null) => {
      console.log('Generated password:', generatedPassword);
      if (generatedPassword) {
        this.passwordFormControl.setValue(generatedPassword);
      }
    });
  }
}
