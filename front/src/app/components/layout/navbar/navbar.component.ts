import { Component, inject, OnDestroy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterLink } from '@angular/router';
import { ConfirmModalComponent } from '../../modals/confirm-modal/confirm-modal.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthService } from '../../../services/auth.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastWrapper } from '../../../utils/toast.wrapper';
import { VaultService } from '../../../services/vault.service';
import { BaseComponent } from '../../base-component/base-component.component';
import { Subscription, take } from 'rxjs';
import { DataService } from '../../../services/data.service';
import { Vault } from '../../../entities/vault';
import { MatMenuModule } from '@angular/material/menu';
import { CommonModule } from '@angular/common';
import { AddVaultModalComponent } from './modals/add-vault-modal/add-vault-modal.component';

@Component({
  selector: 'app-navbar',
  imports: [
    MatIconModule,
    MatButtonModule,
    RouterLink,
    MatTooltipModule,
    MatDialogModule,
    MatMenuModule,
    CommonModule
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent extends BaseComponent implements OnDestroy {

  subscription: Subscription = new Subscription();
  vaults!: Vault[] | null;

  constructor(
    private dialog: MatDialog,
    private authService: AuthService,
    protected vaultService: VaultService,
    private dataService: DataService,
    private router: Router
  ) {
    super(inject(NgxSpinnerService));
    this.setupSubscriptions();
  }

  setupSubscriptions() {
    this.subscription.add(this.dataService.vaults.subscribe(vaults => {
      if (vaults) {
        this.vaults = vaults;
      }
    }));
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  openCreateVaultModal() {
    this.dialog.open(AddVaultModalComponent, {
      panelClass: 'custom-modal',
      data: {
        title: 'Create New Vault',
        message: 'Please enter the name for the new vault.',
        confirmText: 'Create Vault',
        cancelText: 'Cancel',
        width: '400px',
        height: 'auto',
        closeOnNavigation: false,
        disableClose: true,
        autoFocus: true
      }
    }).afterClosed().pipe(take(1)).subscribe((result) => {
      if (result) {
        this.dataService.addVault(result);
        this.router.navigate(['/vault', result.id]);
      }
    })
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
        this.onSignoutConfirmed();
      }
    });
  }

  onSignoutConfirmed() {
    this.startLoading();
    console.log('Signing out...');
    this.authService.signout$().pipe(take(1)).subscribe({
      next: (result) => {
        console.log('Signout result:', result);
        this.onSignoutSuccess();
      },
      error: (error: any) => {
        this.displayError('Signout failed', error);
        this.stopLoading();
      },
    });
  }

  onSignoutSuccess() {
    ToastWrapper.success('Signed out successfully');
    setTimeout(() => {
      window.location.reload();
    }, 1500)
  }
}
