import { Component } from '@angular/core';
import { Login } from '../../../entities/login';
import { DataService } from '../../../services/data.service';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import {ClipboardModule} from '@angular/cdk/clipboard';
import { ToastWrapper } from '../../../utils/toast.wrapper';

@Component({
  standalone: true,
  selector: 'app-selected-login',
  imports: [
    MatIconModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    CommonModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    ClipboardModule
  ],
  templateUrl: './selected-login.component.html',
  styleUrl: './selected-login.component.css'
})
export class SelectedLoginComponent {
  login!: Login | null;
  // form: FormGroup = new FormGroup({
  //   title: new FormControl(''),
  //   identifier: new FormControl(''),
  //   password: new FormControl(''),
  //   url: new FormControl(''),
  //   notes: new FormControl('')
  // });
  showPassword = false;
  title = '';
  identifier = '';
  password = '';
  url = '';
  notes = '';

  constructor(private dataService: DataService) {
    console.log('SelectedLoginComponent initialized');
    this.dataService.selectedLogin.subscribe((login: Login | null) => {
      this.login = login;
      this.setValues();
      console.log('SelectedLoginComponent : Selected login updated:', this.login);
    });
  }

  setValues() {
    console.log('Sets values for selected login:', this.login);
    
    if (this.login) {
      this.title = this.login.decryptedData?.title || '';
      this.identifier = this.login.decryptedData?.identifier || '';
      this.password = this.login.decryptedData?.password || '';
      this.url = this.login.decryptedData?.url || '';
      this.notes = this.login.decryptedData?.notes || '';
      // this.form.get('title')?.setValue(this.login?.decryptedData?.title || '');
      // this.form.get('identifier')?.setValue(this.login?.decryptedData?.identifier || '');
      // this.form.get('password')?.setValue(this.login?.decryptedData?.password || '');
      // this.form.get('url')?.setValue(this.login?.decryptedData?.url || '');
      // this.form.get('notes')?.setValue(this.login?.decryptedData?.notes || '');
    }
  }

  close() {
    this.dataService.setSelectedLogin(null);
  }


  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
    const passwordField = document.querySelector<HTMLInputElement>('#password');
    if (passwordField) {
      passwordField.type = passwordField.type === 'password' ? 'text' : 'password';
    }
  }

  openEditModal() {
    console.log('Open edit modal for login:', this.login);
  }

  openDeleteModal() {
    console.log('Open delete modal for login:', this.login);
  }

  getIdentifier() {
    // ToastWrapper.info('Value copied to clipboard');
    return this.login?.decryptedData?.identifier || '';
  }

  selectText(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    inputElement.readOnly = false; // Allow selection by temporarily removing readonly
    inputElement.select(); // Select the text
    setTimeout(() => {
      inputElement.readOnly = true; // Re-enable readonly after selection
    }, 0);
    ToastWrapper.info('Value copied to clipboard');
  }
}
