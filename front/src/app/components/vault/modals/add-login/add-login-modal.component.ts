import { Component, inject } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { GeneratePasswordModalComponent } from './generate-password-modal/generate-password-modal.component';
import { CreateLoginDto, DecryptedData, Login } from '../../../../entities/login';
import { CryptoUtilsV1, uint8ArrayToBase64 } from '../../../../utils/crypto.utils';
import { VaultService } from '../../../../services/vault.service';
import { AuthService } from '../../../../services/auth.service';
import { LoginService } from '../../../../services/login.service';
import { ToastWrapper } from '../../../../utils/toast.wrapper';
import { DialogRef } from '@angular/cdk/dialog';

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
  templateUrl: './add-login-modal.component.html',
  styleUrl: './add-login-modal.component.css'
})
export class AddLoginModalComponent {
  data = inject(MAT_DIALOG_DATA);
  dialog = inject(MatDialog);
  titleFormControl = new FormControl('', [Validators.required]);
  identifierFormControl = new FormControl('');
  passwordFormControl = new FormControl('');
  urlFormControl = new FormControl('');
  notesFormControl = new FormControl('');
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
    private dialogRef: DialogRef<AddLoginModalComponent>
  ) {

  }

  async onSubmit() {
    console.log('Form submitted with data:', this.form.value);
    if (this.form.invalid) {
      console.error('Form is invalid:', this.form.errors);
      return;
    }
    this.loading = true;
    this.spinner.show();
    const decryptedData: DecryptedData = DecryptedData.fromObject({
      title: this.titleFormControl.value!,
      identifier: this.identifierFormControl.value || '',
      password: this.passwordFormControl.value || '',
      url: this.urlFormControl.value || '',
      notes: this.notesFormControl.value || ''
    });
    const encryptionResult = await CryptoUtilsV1.encryptDataAsync(this.vaultService.getKey(), decryptedData.toString());
    const createLogin: CreateLoginDto = {
      userId: AuthService.getUserId()!,
      encryptedDataBase64: uint8ArrayToBase64(encryptionResult.ciphertext),
      initializationVectorBase64: uint8ArrayToBase64(encryptionResult.initializationVector),
      encryptionVersion: encryptionResult.encryptionVersion,
      tagNames: []
    };
    try {
      const login: Login = await this.loginService.createLoginAsync(createLogin);
      console.log('Login created successfully:', login);
      this.dialog.closeAll();
    } catch (error: any) {
      console.error('Error creating login:', error);
      ToastWrapper.error('Failed to create login: ', error.message || 'Unknown error');
    } finally {
      this.spinner.hide();
      this.loading = false;
    }
    console.log('Form submission completed');
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
