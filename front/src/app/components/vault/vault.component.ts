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
import { AddLoginModalComponent } from './modals/add-login/add-login-modal.component';
import { Login, UpdateLoginDto } from '../../entities/login';
import { CommonModule, KeyValue } from '@angular/common';
import { CardStackComponent } from './card-stack/card-stack.component';
import { DataService } from '../../services/data.service';
import { SelectedLoginComponent } from "./selected-login/selected-login.component";
import { MatTooltipModule } from '@angular/material/tooltip';
import { SettingsModalComponent } from './modals/settings/settings-modal.component';
import { ChangeMasterPasswordModalComponent } from './modals/change-master-password-modal/change-master-password-modal.component';

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
      this.allLogins = await this.vaultService.decryptAllLogins(this.allLogins);
      this.displayedLogins = this.allLogins.filter(login => !login.deleted);
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
    if (confirm('Are you sure you want to signout?')) {
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
  }

  openAddLoginModal() {
    const dialogRef = this.dialog.open(AddLoginModalComponent,
      {
        panelClass: 'custom-modal',
        width: '600px',
        height: 'auto',
        closeOnNavigation: false,
        disableClose: true,
        autoFocus: true
      }
    );

    dialogRef.afterClosed().subscribe(async (result: Login) => {
      if (result) {
        this.allLogins.push(result);
        this.displayedLogins.push(result);
        this.computeStacks();
        console.log(`Add login :`, result);
      }
    });
  }

  select(login: Login) {
    console.log('Card stack clicked');
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
          console.log('Master password changed, re-encrypting all logins... old key', this.vaultService.exportKey());
          this.vaultService.clearKey();
          await this.vaultService.setKeyAsync(newMasterPassword);
          console.log('Master password changed, re-encrypting all logins... new key', this.vaultService.exportKey());
          
          this.dataService.setSelectedLogin(null);
          console.log('Changing master password...', this.allLogins);
          
          this.allLogins = await this.vaultService.encryptAllLogins(this.allLogins);
          let updatedLogins = await this.loginService.updateLoginBulkAsync(this.allLogins.map(l => UpdateLoginDto.fromLogin(l)));
          updatedLogins = await this.vaultService.decryptAllLogins(updatedLogins);
          console.log('Logins before changing master password:', this.allLogins);
          
          console.log('Updated logins after changing master password:', updatedLogins);
          
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
