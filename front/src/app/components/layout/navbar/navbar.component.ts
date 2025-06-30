import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { ConfirmModalComponent } from '../../modals/confirm-modal/confirm-modal.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthService } from '../../../services/auth.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastWrapper } from '../../../utils/toast.wrapper';

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
export class NavbarComponent {
  constructor(
    private dialog: MatDialog,
    private authService: AuthService,
    private spinner: NgxSpinnerService
  ) { }

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
}
