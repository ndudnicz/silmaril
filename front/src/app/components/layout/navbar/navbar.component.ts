import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ConfirmModalComponent } from '../../modals/confirm-modal/confirm-modal.component';
import { AuthService } from '../../../services/auth.service';
import { ToastWrapper } from '../../../utils/toast.wrapper';
import { VaultService } from '../../../services/vault.service';
import { BaseComponent } from '../../base-component/base-component.component';
import { Subscription, take } from 'rxjs';
import { DataService } from '../../../services/data.service';
import { AddVaultModalComponent } from './modals/add-vault-modal/add-vault-modal.component';
import { DialogService } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, ButtonModule, TooltipModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent extends BaseComponent {
  private readonly dialogService = inject(DialogService);
  private readonly authService = inject(AuthService);
  private readonly dataService = inject(DataService);
  protected readonly vaultService = inject(VaultService);
  private readonly router = inject(Router);
  private readonly subscription: Subscription = new Subscription();
  protected readonly vaults = toSignal(this.dataService.vaults$(), { initialValue: [] });

  // constructor() {
  //   super();
  //   this.setupSubscriptions();
  // }

  // setupSubscriptions() {
  //   this.subscription.add(this.dataService.vaults.subscribe(vaults => {
  //     if (vaults) {
  //       this.vaults = vaults;
  //     }
  //   }));
  // }

  // ngOnDestroy() {
  //   this.subscription.unsubscribe();
  // }

  openCreateVaultModal() {
    this.dialogService
      .open(AddVaultModalComponent, {
        header: 'Create New Vault',
        width: '400px',
        height: 'auto',
        closable: true,
        data: {
          message: 'Please enter the name for the new vault.',
          confirmText: 'Create Vault',
          cancelText: 'Cancel',
        },
      })
      ?.onClose.pipe(take(1))
      .subscribe((result) => {
        if (result) {
          this.dataService.addVault(result);
          this.router.navigate(['/vault', result.id]);
        }
      });
  }

  signout() {
    this.dialogService
      .open(ConfirmModalComponent, {
        header: 'Sign out',
        width: '400px',
        height: 'auto',
        closable: false,
        data: {
          message: 'Are you sure you want to signout?',
          confirmText: 'Yes',
          cancelText: 'No',
        },
      })
      ?.onClose.pipe(take(1))
      .subscribe(async (confirmed: boolean) => {
        if (confirmed) {
          this.onSignoutConfirmed();
        }
      });
  }

  onSignoutConfirmed() {
    this.startLoading();
    console.log('Signing out...');
    this.authService
      .signout$()
      .pipe(take(1))
      .subscribe({
        next: (result) => {
          console.log('Signout result:', result);
          this.onSignoutSuccess();
        },
        error: (error: unknown) => {
          this.displayError('Signout failed', error);
          this.stopLoading();
        },
      });
  }

  onSignoutSuccess() {
    ToastWrapper.success('Signed out successfully');
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  }

  displayMenu() {
    console.log('Displaying menu');
  }
}
