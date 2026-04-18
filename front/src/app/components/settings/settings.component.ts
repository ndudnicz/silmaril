import { Component, inject } from '@angular/core';
import { BaseComponent } from '../base-component/base-component.component';
import { ChangePasswordModalComponent } from './modals/change-password/change-password-modal.component';
import { ChangeUsernameModalComponent } from './modals/change-username/change-username-modal.component';
import { take } from 'rxjs';
import { DialogService } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-settings',
  imports: [ButtonModule],
  templateUrl: './settings.component.html',
})
export class SettingsComponent extends BaseComponent {
  private readonly dialogService = inject(DialogService);

  openChangePasswordModal() {
    this.dialogService
      .open(ChangePasswordModalComponent, {
        header: 'Change your password',
        width: '400px',
        height: 'auto',
        closable: true,
      })
      ?.onClose.pipe(take(1))
      .subscribe();
  }

  openChangeUserNameModal() {
    this.dialogService
      .open(ChangeUsernameModalComponent, {
        header: 'Change your username',
        width: '400px',
        height: 'auto',
        closable: true,
      })
      ?.onClose.pipe(take(1))
      .subscribe();
  }
}
