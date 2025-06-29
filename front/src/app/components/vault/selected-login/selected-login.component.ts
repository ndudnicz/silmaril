import { Component } from '@angular/core';
import { Login, UpdateLoginDto } from '../../../entities/login';
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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmModalComponent } from '../../modals/confirm-modal/confirm-modal.component';
import { LoginService } from '../../../services/login.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { AddEditLoginModalComponent } from '../modals/add-edit-login/add-edit-login-modal.component';

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
    ClipboardModule,
    MatDialogModule
  ],
  templateUrl: './selected-login.component.html',
  styleUrl: './selected-login.component.css'
})
export class SelectedLoginComponent {
  login!: Login | null;
  showPassword = false;
  title = '';
  identifier = '';
  password = '';
  url = '';
  notes = '';
  loading = false;

  constructor(
    private dataService: DataService,
    private dialog: MatDialog,
    private loginService: LoginService,
    private spinner: NgxSpinnerService
  ) {
    console.log('SelectedLoginComponent initialized');
    this.dataService.selectedLogin.subscribe((login: Login | null) => {
      this.login = login;
      this.setValues();
      console.log('SelectedLoginComponent : Selected login updated:', this.login);
    });
  }

  setValues() {
    console.log('Sets values for selected login:', this.login);
    this.showPassword = false;
    if (this.login) {
      this.title = this.login.decryptedData?.title || '';
      this.identifier = this.login.decryptedData?.identifier || '';
      this.password = this.login.decryptedData?.password || '';
      this.url = this.login.decryptedData?.url || '';
      this.notes = this.login.decryptedData?.notes || '';
    }
  }

  close() {
    this.dataService.setSelectedLogin(null);
  }


  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
    const passwordField = document.querySelector<HTMLInputElement>('#selected-login-password');
    if (passwordField) {
      passwordField.type = passwordField.type === 'password' ? 'text' : 'password';
    }
  }

  openEditModal() {
   const dialogRef = this.dialog.open(AddEditLoginModalComponent,
      {
        panelClass: 'custom-modal',
        width: '600px',
        height: 'auto',
        closeOnNavigation: false,
        disableClose: true,
        autoFocus: true,
        data: {
          mode: AddEditLoginModalComponent.MODAL_MOD.EDIT,
          login: this.login
        }
      }
    );

    dialogRef.afterClosed().subscribe(async (result: Login) => {
      if (result) {
        console.log('Edit login result:', result);
        this.dataService.setUpdatedLogin(result);
        this.dataService.setSelectedLogin(result); // Clear selected login after edit
      }
    });
  }

  openDeleteModal() {
    this.dialog.open(ConfirmModalComponent, {
      panelClass: 'custom-modal',
      data: {
        title: `Delete Login ${this.login?.decryptedData?.title}`,
        message: `Are you sure you want to delete the login "${this.login?.decryptedData?.title}"? The data will be sent to the trash bin and can be restored later.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        width: '400px',
        height: 'auto',
        closeOnNavigation: false,
        disableClose: true,
        autoFocus: true
      }
    }).afterClosed().subscribe(async (confirmed: boolean) => {
      console.log('Delete modal closed with confirmation:', confirmed);
      if (confirmed) {
        this.spinner.show();
        this.loading = true;
        try {
          this.login!.deleted = true;
          const updatedLogin = await this.loginService.updateLoginAsync(UpdateLoginDto.fromLogin(this.login!));
          console.log('Login deleted successfully:', updatedLogin);
          
          this.dataService.setUpdatedLogin(updatedLogin);
          this.dataService.setSelectedLogin(null);
          ToastWrapper.success('Login deleted successfully');
        } catch (error: any) {
          ToastWrapper.error('Failed to delete login: ', error.message || 'Unknown error');
          console.error('Error during login deletion:', error);
        } finally {
          this.loading = false;
          this.spinner.hide();
        }
      }
    })
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
