import { Component, inject, OnInit } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { GeneratePasswordModalComponent } from './generate-password-modal/generate-password-modal.component';

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
export class AddLoginModalComponent implements OnInit {
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

  constructor(private spinner: NgxSpinnerService) {

  }

  ngOnInit(): void {
    console.log('AddLoginModalComponent initialized with data:', this.data);
    // this.form = 
  }

  onSubmit() {
    console.log('Form submitted with data:', this.form.value);
    // Here you would typically handle the form submission, e.g., send the data to a service
  }

  onCancel() {
    console.log('Form submission cancelled');
    // Handle cancellation logic, e.g., close the dialog
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
    const passwordField = document.querySelector<HTMLInputElement>('#password');
    if (passwordField) {
      passwordField.type = passwordField.type === 'password' ? 'text' : 'password';
    }
  }

  generatePassword() {
    this.dialog.open(GeneratePasswordModalComponent, {}).afterClosed().subscribe((generatedPassword: string | null) => {
      if (generatedPassword) {
        this.passwordFormControl.setValue(generatedPassword);
      }
    });
  }
}
