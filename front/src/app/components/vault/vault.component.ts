import { Component, inject, OnInit } from '@angular/core';
import { VaultService } from '../../services/vault.service';
import { LoginEncrypted } from '../../entities/login';
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
  private loginsEncrypted: LoginEncrypted[] = [];

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
      this.loginsEncrypted = await this.loginService.getLoginsAsync();
      console.log('Data fetched:', this.loginsEncrypted);
      if (this.loginsEncrypted.length === 0) {
        ToastWrapper.info('No data found. Please add some.');
      } else {
        ToastWrapper.success('Data fetched successfully');
      }
    } catch (error: any) {
      ToastWrapper.error('Failed to fetch data: ', error.message ?? error);
      console.error('Error fetching data:', error);
    } finally {
      this.spinner.hide();
    }
  }

  async logout() {
    if (confirm('Are you sure you want to logout?')) {
      this.spinner.show();
      console.log('Logging out...');
      try {
        await this.authService.logoutAsync();
        this.vaultService.clearKey();
        this.vaultService.clearSalt();
        ToastWrapper.success('Logged out successfully');
        setTimeout(() => {
          this.spinner.hide();
          window.location.reload();
        }, 1500)

      } catch (error: any) {
        ToastWrapper.error('Logout failed: ', error.message ?? error);
        console.error('Error during logout:', error);
        this.spinner.hide();
      } 
    }
  }

  // async refreshToken() {
  //   this.spinner.show();
  //   try {
  //     const result = await this.authService.refreshTokenAsync();
  //     if (result) {
  //       ToastWrapper.success('Token refreshed successfully');
  //     } else {
  //       ToastWrapper.error('Failed to refresh token', null);
  //     }
  //   } catch (error: any) {
  //     ToastWrapper.error('Error refreshing token: ', error.message ?? error);
  //     console.error('Error during token refresh:', error);
  //   } finally {
  //     this.spinner.hide();
  //   }
  // }
  openAddLoginModal() {
    const dialogRef = this.dialog.open(AddLoginModalComponent,
      {
        panelClass: 'custom-modal',
        width: '600px',
        height: '600px',
        disableClose: true,
        autoFocus: false
      }
    );

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }
}
