import { Component, inject, OnDestroy } from '@angular/core';
import { Login } from '../../../entities/login';
import { DataService } from '../../../services/data.service';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { ToastWrapper } from '../../../utils/toast.wrapper';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmModalComponent } from '../../modals/confirm-modal/confirm-modal.component';
import { LoginService } from '../../../services/login.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { AddEditLoginModalComponent } from '../modals/add-edit-login/add-edit-login-modal.component';
import { BaseComponent } from '../../base-component/base-component.component';
import { Subscription, take } from 'rxjs';
import { VaultService } from '../../../services/vault.service';
import { UpdateLoginDto } from '../../../entities/update/update-login-dto';

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
export class SelectedLoginComponent extends BaseComponent implements OnDestroy {
  login!: Login | null;
  showPassword = false;
  title = '';
  identifier = '';
  password = '';
  url = '';
  notes = '';
  subscriptions: Subscription = new Subscription();

  constructor(
    private dataService: DataService,
    private dialog: MatDialog,
    private loginService: LoginService,
    private vaultService: VaultService,
  ) {
    super(inject(NgxSpinnerService));
    this.setupLoginSubscriptions();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  setupLoginSubscriptions() {
    this.subscriptions.add(this.dataService.selectedLogin.subscribe((login: Login | null) => {
      this.login = login;
      this.setValues();
    }));
  }

  setValues() {
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

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
    const passwordField = document.querySelector<HTMLInputElement>('#selected-login-password');
    if (passwordField) {
      passwordField.type = passwordField.type === 'password' ? 'text' : 'password';
    }
  }

  openEditModal(): void {
    this.dialog.open(AddEditLoginModalComponent,
      {
        panelClass: 'custom-modal',
        width: '600px',
        height: 'auto',
        closeOnNavigation: false,
        disableClose: true,
        autoFocus: true,
        data: {
          mode: AddEditLoginModalComponent.MODAL_MOD.EDIT,
          login: this.login,
          vaultId: this.login!.vaultId
        }
      }
    ).afterClosed().pipe(take(1)).subscribe((result: Login) => {
      if (result) {
        this.dataService.setUpdatedLogin(result);
        this.dataService.setSelectedLogin(result);
      }
    });
  }

  openSoftDeleteModal(): void {
    this.dialog.open(ConfirmModalComponent, {
      panelClass: 'custom-modal',
      width: '400px',
      height: 'auto',
      closeOnNavigation: false,
      disableClose: true,
      autoFocus: true,
      data: {
        title: `Delete Login ${this.login?.decryptedData?.title}`,
        message: `Are you sure you want to delete the login "${this.login?.decryptedData?.title}"? It will be sent to the recycle bin and can be restored later.`,
        confirmText: 'Confirm',
        cancelText: 'Cancel'
      }
    }).afterClosed().pipe(take(1)).subscribe((confirmed: boolean): void => {
      if (confirmed) {
        this.startLoading();
        this.login!.deleted = true;
        this.loginService.updateLogin$(UpdateLoginDto.fromLogin(this.login!))
          .pipe(take(1))
          .subscribe({
            next: (updatedLogin: Login) => this.onSoftDeleteLoginSuccess(updatedLogin),
            error: (error: any) => {
              this.displayError('Error deleting login', error);
              this.stopLoading();
            }
          });
      }
    })
  }

  onSoftDeleteLoginSuccess(updatedLogin: Login): void {
    console.log('Login soft deleted successfully:', updatedLogin);
    this.dataService.setDeletedLogin(updatedLogin);
    this.dataService.setSelectedLogin(null);
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
