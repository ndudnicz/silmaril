import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { ConfirmModalComponent } from '../../modals/confirm-modal/confirm-modal.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthService } from '../../../services/auth.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastWrapper } from '../../../utils/toast.wrapper';
import { VaultService } from '../../../services/vault.service';
import { BaseComponent } from '../../base-component/base-component.component';
import { pipe, take } from 'rxjs';

@Component({
  selector: 'app-navbar',
  imports: [
    MatIconModule,
    MatButtonModule,
    RouterLink,
    MatTooltipModule,
    MatDialogModule
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent extends BaseComponent {
  constructor(
    private dialog: MatDialog,
    private authService: AuthService,
    protected vaultService: VaultService
  ) {
    super(inject(NgxSpinnerService));
    console.log('NavbarComponent initialized', this.vaultService.isUnlocked());
  }

  signout() {
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
    }).afterClosed().pipe(take(1)).subscribe(async (confirmed: boolean) => {
      if (confirmed) {
        this.startLoading();
        console.log('Signing out...');
        this.authService.signout$().pipe(take(1)).subscribe({
          next: (result) => {
            console.log('Signout result:', result);
            
            ToastWrapper.success('Signed out successfully');
            setTimeout(() => {
              window.location.reload();
            }, 1500)
          },
          error: (error: any) => {
            console.error('Signout error:', error);
            this.stopLoading();
            throw error;
          },
        });
      }
    });
  }
}
