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

@Component({
  selector: 'app-vault',
  imports: [
    MatGridListModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule
  ],
  templateUrl: './vault.component.html',
  styleUrl: './vault.component.css'
})
export class VaultComponent implements OnInit {

  readonly dialog = inject(MatDialog);
  private logins: Login[] = [];

  constructor(
    private vaultService: VaultService,
    private authService: AuthService,
    private loginService: LoginService,
    private spinner: NgxSpinnerService
  ) { }

  async ngOnInit(): Promise<void> {
    this.spinner.show();
    try {
      console.log('VaultComponent initialized', this.vaultService.isUnlocked(), this.vaultService.getKey());
      this.logins = await this.loginService.getLoginsAsync();
      this.logins = await this.decryptAllLogins(this.logins);
    } catch (error: any) {
      ToastWrapper.error('Failed to fetch data: ', error.message ?? error);
      console.error('Error fetching data:', error);
    } finally {
      this.spinner.hide();
    }
  }

  async decryptAllLogins(logins: Login[]): Promise<Login[]> {
    return new Promise<Login[]>(async (resolve, reject) => {
      this.spinner.show();
      try {
        this.logins = await Promise.all(this.logins.map(async (login: Login) => {
          const decryptDataString = await CryptoUtilsV1.decryptDataAsync(this.vaultService.getKey(), login.encryptedData!, login.initializationVector!);
          login.decryptedData = DecryptedData.fromString(decryptDataString);
          return login;
        }));
        console.log('All logins decrypted:', this.logins);
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
      console.log('Logging out...');
      try {
        await this.authService.signoutAsync();
        this.vaultService.clearKey();
        this.vaultService.clearSalt();
        ToastWrapper.success('Logged out successfully');
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

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }
}
