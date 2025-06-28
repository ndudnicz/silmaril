import { Component, inject, OnInit } from '@angular/core';
import { VaultService } from '../../services/vault.service';
import { LoginService } from '../../services/login.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService } from '../../services/auth.service';
import { ToastWrapper } from '../../utils/toast.wrapper';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddEditLoginModalComponent } from './modals/add-edit-login/add-edit-login-modal.component';
import { Login, UpdateLoginDto } from '../../entities/login';
import { CommonModule, KeyValue } from '@angular/common';
import { CardStackComponent } from './card-stack/card-stack.component';
import { DataService } from '../../services/data.service';
import { SelectedLoginComponent } from "./selected-login/selected-login.component";
import { MatTooltipModule } from '@angular/material/tooltip';
import { SettingsModalComponent } from './modals/settings/settings-modal.component';
import { ChangeMasterPasswordModalComponent } from './modals/change-master-password-modal/change-master-password-modal.component';
import { ConfirmModalComponent } from '../modals/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-vault',
  imports: [
    MatGridListModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    CardStackComponent,
    CommonModule,
    SelectedLoginComponent,
    MatTooltipModule
  ],
  templateUrl: './vault.component.html',
  styleUrl: './vault.component.css'
})
export class VaultComponent implements OnInit {

  readonly dialog = inject(MatDialog);
  allLogins: Login[] = [];
  displayedLogins: Login[] = [];
  displayedLoginStackEntries: KeyValue<string, Login[]>[] = [];
  selectedLogin: Login | null = null;
  loading = false;

  constructor(
    private vaultService: VaultService,
    private authService: AuthService,
    private loginService: LoginService,
    private spinner: NgxSpinnerService,
    private dataService: DataService
  ) {
    this.dataService.selectedLogin.subscribe((login: Login | null) => {
      this.selectedLogin = login;
      console.log('VaultComponent : Selected login updated:', this.selectedLogin);
    });

    this.dataService.deletedLogin.subscribe((login: Login | null) => {
      if (login) {
        console.log('VaultComponent : Deleted login received:', login);
        this.allLogins = this.allLogins.filter(l => l.id !== login.id);
        this.setDisplayedLogins();
        this.computeStacks();
        ToastWrapper.success('Login deleted successfully');
      }
    });

    this.dataService.updatedLogin.subscribe((login: Login | null) => {
      if (login) {
        console.log('VaultComponent : Updated login received:', login);
        const index = this.allLogins.findIndex(l => l.id === login.id);
        if (index !== -1) {
          this.allLogins[index] = login;
          this.setDisplayedLogins();
          this.computeStacks();
          ToastWrapper.success('Login updated successfully');
        } else {
          console.warn('Updated login not found in current logins:', login);
        }
      }
    });
    console.log('VaultComponent initialized');
  }

  async ngOnInit(): Promise<void> {
    this.spinner.show();
    this.loading = true;
    try {
      this.allLogins = await this.loginService.getLoginsAsync();
      this.allLogins = await this.vaultService.decryptAllLoginsAsync(this.allLogins);
      this.setDisplayedLogins();
      this.computeStacks();
      console.log('vault selectedLogin:', this.selectedLogin);
    } catch (error: any) {
      ToastWrapper.error('Failed to fetch data: ', error.message ?? error);
      console.error('Error fetching data:', error);
    } finally {
      this.spinner.hide();
      this.loading = false;
    }
  }

  setDisplayedLogins() {
    this.displayedLogins = this.allLogins.filter(login => !login.deleted);
  }

  computeStacks() {
    let loginStacks: any = {};
    for (const login of this.displayedLogins) {
      const stackName = login.decryptedData?.title.charAt(0).toLocaleUpperCase() || 'Uncategorized';
      if (!loginStacks[stackName]) {
        loginStacks[stackName] = [];
      }
      loginStacks[stackName].push(login);
    }
    this.displayedLoginStackEntries = Object.entries(loginStacks as Record<string, Login[]>)
      .map(([key, value]) => ({ key, value }));
    this.displayedLoginStackEntries.sort((a, b) => a.key.localeCompare(b.key));
  }

  async signout() {
    this.dialog.open(ConfirmModalComponent, {
      panelClass: 'custom-modal',
      data: {
        title: 'Sign Out',
        message: 'Are you sure you want to signout?',
        confirmText: 'Sign Out',
        cancelText: 'Cancel',
        width: '400px',
        height: 'auto',
        closeOnNavigation: false,
        disableClose: true,
        autoFocus: true
      }
    }).afterClosed().subscribe(async (confirmed: boolean) => {
      if (confirmed) {
      this.spinner.show();
      console.log('Signing out...');
      try {
        await this.authService.signoutAsync();
        ToastWrapper.success('Signed out successfully');
        setTimeout(() => {
          this.spinner.hide();
          window.location.reload();
        }, 1500)
      } catch (error: any) {
        ToastWrapper.error('Signout failed: ', error.message ?? error);
        console.error('Error during signout:', error);
        this.spinner.hide();
      }
      }
    });
  }

  openAddLoginModal() {
    const dialogRef = this.dialog.open(AddEditLoginModalComponent,
      {
        panelClass: 'custom-modal',
        width: '600px',
        height: 'auto',
        closeOnNavigation: false,
        disableClose: true,
        autoFocus: true,
        data: {
          mode: AddEditLoginModalComponent.MODAL_MOD.ADD,
          login: null
        }
      }
    );

    dialogRef.afterClosed().subscribe(async (result: Login) => {
      if (result) {
        this.allLogins.push(result);
        this.displayedLogins.push(result);
        this.computeStacks();
      }
    });
  }

  openSettingsModal() {
    console.log('Settings clicked');
    const dialogRef = this.dialog.open(SettingsModalComponent,
      {
        panelClass: 'custom-modal',
        width: '400px',
        height: 'auto',
        closeOnNavigation: false,
        disableClose: true,
        autoFocus: true
      }
    );
    dialogRef.afterClosed().subscribe(_ => { });
  }

  openChangeMasterPasswordModal() {
    const dialogRef = this.dialog.open(ChangeMasterPasswordModalComponent,
      {
        panelClass: 'custom-modal',
        width: '400px',
        height: 'auto',
        closeOnNavigation: false,
        disableClose: true,
        autoFocus: true
      }
    );
    dialogRef.afterClosed().subscribe(async newMasterPassword => {
      if (newMasterPassword != null) {
        try {
          this.spinner.show();
          this.loading = true;
          this.vaultService.clearKey();
          await this.vaultService.setKeyAsync(newMasterPassword);
          this.dataService.setSelectedLogin(null);
          this.allLogins = await this.vaultService.encryptAllLoginsAsync(this.allLogins);
          let updatedLogins = await this.loginService.updateLoginBulkAsync(this.allLogins.map(l => UpdateLoginDto.fromLogin(l)));
          updatedLogins = await this.vaultService.decryptAllLoginsAsync(updatedLogins);
        } catch (error: any) {
          ToastWrapper.error('Failed to change master password: ', error.message ?? error);
          console.error('Error changing master password:', error);
          this.loading = false;
          this.spinner.hide();
        } finally {
          this.loading = false;
          this.spinner.hide();
          ToastWrapper.success('Master password changed successfully');
        }
      }
    });
  }

  async openDeletedLoginsModal() {
    // Implement logic to open deleted logins modal
    console.log('Open deleted logins modal');
  }
}
