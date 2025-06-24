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
import { DecryptedData, Login } from '../../entities/login';
import { CryptoUtilsV1 } from '../../utils/crypto.utils';
import { CommonModule, KeyValue } from '@angular/common';
import { CardStackComponent } from './card-stack/card-stack.component';
import { DataService } from '../../services/data.service';
import { SelectedLoginComponent } from "./selected-login/selected-login.component";

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
    SelectedLoginComponent
],
  templateUrl: './vault.component.html',
  styleUrl: './vault.component.css'
})
export class VaultComponent implements OnInit {

  readonly dialog = inject(MatDialog);
  logins: Login[] = [];
  loginStackEntries: KeyValue<string, Login[]>[] = [];
  selectedLogin: Login | null = null;

  constructor(
    private vaultService: VaultService,
    private authService: AuthService,
    private loginService: LoginService,
    private spinner: NgxSpinnerService,
    private dataService: DataService
  ) { }

  async ngOnInit(): Promise<void> {
    this.spinner.show();
    try {
      // console.log('VaultComponent initialized', this.vaultService.isUnlocked(), this.vaultService.getKey());
      this.logins = await this.loginService.getLoginsAsync();
      this.logins = await this.decryptAllLogins(this.logins);
      this.computeStacks();
      this.dataService.selectedLogin.subscribe((login: Login | null) => {
        this.selectedLogin = login;
        console.log('VaultComponent : Selected login updated:', this.selectedLogin);
      });
    } catch (error: any) {
      ToastWrapper.error('Failed to fetch data: ', error.message ?? error);
      console.error('Error fetching data:', error);
    } finally {
      this.spinner.hide();
    }
  }

  computeStacks() {
    let loginStacks: any = {};
    for (const login of this.logins) {
      const stackName = login.decryptedData?.title.charAt(0).toLocaleUpperCase() || 'Uncategorized';
      if (!loginStacks[stackName]) {
        loginStacks[stackName] = [];
      }
      loginStacks[stackName].push(login);
    }
    this.loginStackEntries = Object.entries(loginStacks as Record<string, Login[]>)
      .map(([key, value]) => ({ key, value }));
    this.loginStackEntries.sort((a, b) => a.key.localeCompare(b.key));
  }

  async decryptLoginData(login: Login): Promise<Login> {
    return new Promise<Login>(async (resolve, reject) => {
      try {
        const decryptDataString = await CryptoUtilsV1.decryptDataAsync(this.vaultService.getKey(), login.encryptedData!, login.initializationVector!);
        login.decryptedData = DecryptedData.fromString(decryptDataString);
        return resolve(login);
      } catch (error: any) {
        reject(error);
      } finally {
      }
    });
  }

  async decryptAllLogins(logins: Login[]): Promise<Login[]> {
    return new Promise<Login[]>(async (resolve, reject) => {
      this.spinner.show();
      try {
        this.logins = await Promise.all(logins.map(this.decryptLoginData.bind(this)));
        // this.logins = await Promise.all(this.logins.map(async (login: Login) => {
        //   const decryptDataString = await CryptoUtilsV1.decryptDataAsync(this.vaultService.getKey(), login.encryptedData!, login.initializationVector!);
        //   login.decryptedData = DecryptedData.fromString(decryptDataString);
        //   return login;
        // }));
        // console.log('All logins decrypted:', this.logins);
        ToastWrapper.success('All logins decrypted successfully');
        return resolve(this.logins);
      } catch (error: any) {
        ToastWrapper.error('Failed to decrypt logins: ', error.message ?? error);
        console.error('Error decrypting logins:', error);
        reject(error);
      } finally {
        this.spinner.hide();
      }
    });
  }

  async signout() {
    if (confirm('Are you sure you want to signout?')) {
      this.spinner.show();
      console.log('Signing out...');
      try {
        await this.authService.signoutAsync();
        this.vaultService.clearKey();
        this.vaultService.clearSalt();
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
      this.logins.push(result);
      this.computeStacks();
      console.log(`Add login :`, result);
    });
  }

  select(login: Login) {
    console.log('Card stack clicked');
  }
}
