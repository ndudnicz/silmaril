import { Component, inject } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { BaseComponent } from '../base-component/base-component.component';
import { ChangePasswordModalComponent } from './modals/change-password/change-password-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ChangeUsernameModalComponent } from './modals/change-username/change-username-modal.component';
import { take } from 'rxjs';

@Component({
  selector: 'app-settings',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatToolbarModule
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent extends BaseComponent {

  constructor(
    private dialog: MatDialog
  ) {
    super(inject(NgxSpinnerService));
  }

  openChangePasswordModal() {
    this.dialog.open(ChangePasswordModalComponent,
      {
        panelClass: 'custom-modal',
        width: '400px',
        height: 'auto',
        closeOnNavigation: false,
        disableClose: true,
        autoFocus: true
      }
    ).afterClosed().pipe(take(1)).subscribe(_ => { });
  }

  openChangeUserNameModal() {
    this.dialog.open(ChangeUsernameModalComponent,
      {
        panelClass: 'custom-modal',
        width: '400px',
        height: 'auto',
        closeOnNavigation: false,
        disableClose: true,
        autoFocus: true
      }
    ).afterClosed().pipe(take(1)).subscribe(_ => { });
  }
}
