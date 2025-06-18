import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-vault',
  imports: [
    MatGridListModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './vault.component.html',
  styleUrl: './vault.component.css'
})
export class VaultComponent implements OnInit {

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

  logout() {
    if (confirm('Are you sure you want to logout?')) {
      this.spinner.show();
      console.log('Logging out...');
      this.vaultService.clearKey();
      this.vaultService.clearSalt();
      this.authService.clearLocalStorage();
      ToastWrapper.success('Logged out successfully');
      setTimeout(() => {
        window.location.reload();
      }, 1000)
    }
  }
}
