import { Component, inject, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { BaseComponent } from '../base-component/base-component.component';
import { MatIconModule } from '@angular/material/icon';
import { Login } from '../../entities/login';
import { catchError, from, Observable, Subscription, switchMap, take, throwError } from 'rxjs';
import { DataService } from '../../services/data.service';
import { CardStacksComponent } from '../card-stacks/card-stacks.component';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LoginService } from '../../services/login.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmModalComponent } from '../modals/confirm-modal/confirm-modal.component';
import { VaultService } from '../../services/vault.service';
import { Vault } from '../../entities/vault';
import { RestoreLoginsModalComponent } from './modals/restore-logins/restore-logins-modal.component';
import { UpdateLoginDto } from '../../entities/update/update-login-dto';
import { EncryptionService } from '../../services/encryption.service';

@Component({
  selector: 'app-recycle-bin',
  imports: [
    MatIconModule,
    CardStacksComponent,
    CommonModule,
    MatToolbarModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
  templateUrl: './recycle-bin.component.html',
  styleUrl: './recycle-bin.component.css'
})
export class RecycleBinComponent extends BaseComponent implements OnInit {

  searchValue: string = '';
  searchBarPlaceholder = 'Search in Recycle Bin';
  allDeletedLogins: Login[] = [];
  displayedLogins: Login[] = [];
  selectedLogins: Login[] = [];
  subscription: Subscription = new Subscription();
  vaults: Vault[] = [];

  constructor(
    private dataService: DataService,
    private loginService: LoginService,
    private vaultService: VaultService,
    private encryptionService: EncryptionService,
    private dialog: MatDialog,
  ) {
    super(inject(NgxSpinnerService));
    this.vaults = this.dataService.getVaults();
  }

  ngOnInit(): void {
    this.loadDeletedLogins();
  }

  loadDeletedLogins() {
    this.startLoading();
    this.getDecryptedDeletedlogins$().pipe(take(1)).subscribe({
      next: (logins: Login[]) => {
        this.allDeletedLogins = logins;
        this.setDisplayedLogins();
        this.stopLoading();
      },
      error: (error: any) => {
        this.stopLoading();
        this.displayError('Failed to load deleted logins', error);
      }
    })
  }

  getDecryptedDeletedlogins$(): Observable<Login[]> {
    return this.loginService.getDeletedLogins$()
      .pipe(
        switchMap(logins => {
          return from(this.encryptionService.decryptAllLoginsAsync(logins, this.vaultService.getDerivedKey()));
        })
      )
  }

  setDisplayedLogins() {
    if (this.allDeletedLogins) {
      this.displayedLogins = this.allDeletedLogins.filter(login => login.deleted);
    } else {
      this.displayedLogins = [];
    }
  }

  select(login: Login): void {
    if (login.selected) {
      this.selectedLogins = this.selectedLogins.filter(l => l !== login);
      login.selected = false;
      return;
    } else {
      this.selectedLogins.push(login);
      login.selected = true;
    }
  }

  restoreSelectedLogins(): void {
    const orphanedLogins = this.selectedLogins.filter(login => !this.vaults.some(vault => vault.id === login.vaultId));
    if (orphanedLogins.length > 0) {
      this.openRestoreLoginsModal(orphanedLogins);
    } else {
      this.openConfirmRestoreLoginsModal();
    }
  }

  openRestoreLoginsModal(orphanedLogins: Login[]): void {
    this.dialog.open(RestoreLoginsModalComponent, {
      data: {
        orphanedLogins: orphanedLogins
      },
      panelClass: 'custom-modal',
      width: '450px',
      height: 'auto',
      disableClose: true,
      autoFocus: false,
      restoreFocus: false
    }).afterClosed().pipe(take(1)).subscribe(destinationVaultId => {
      if (destinationVaultId) {
        this.proceedRestoreSelectedLogins(destinationVaultId);
      }
    });
  }

  openConfirmRestoreLoginsModal(): void {
    this.dialog.open(ConfirmModalComponent, {
      data: {
        title: 'Confirm Restore Logins',
        message: `Are you sure you want to restore ${this.selectedLogins.length} logins?`,
        confirmText: 'Restore',
        cancelText: 'Cancel',
      },
      panelClass: 'custom-modal',
      width: '400px',
      height: 'auto',
      disableClose: true,
      autoFocus: false,
      restoreFocus: false
    }).afterClosed().pipe(take(1)).subscribe(confirmed => {
      if (confirmed) {
        this.proceedRestoreSelectedLogins(null);
      }
    });
  }

  proceedRestoreSelectedLogins(destinationVaultId: string | null): void {
    this.startLoading();
    this.selectedLogins.forEach(login => {
      login.vaultId = destinationVaultId ?? login.vaultId;
      login.deleted = false;
    });
    this.loginService.updateLogins$(this.selectedLogins.map(login => UpdateLoginDto.fromLogin(login)))
      .pipe(take(1))
      .subscribe({
        next: updatedlogins => {
          this.onRestoreLoginSuccess();
        },
        error: (error: any) => {
          this.stopLoading();
          this.displayError('Failed to restore logins', error);
        }
      })
  }

  onRestoreLoginSuccess(): void {
    this.allDeletedLogins = this.allDeletedLogins.filter(login => !this.selectedLogins.includes(login));
    this.setDisplayedLogins();
    this.clearSelection();
    this.stopLoading();
  }

  confirmDeleteSelectedLogins(): void {
    this.dialog.open(ConfirmModalComponent, {
      data: {
        title: 'Confirm Permanent Deletion',
        message: `Are you sure you want to permanently delete ${this.selectedLogins.length} logins? This action cannot be undone.`,
        confirmText: 'Permanently Delete',
        cancelText: 'Cancel'
      },
      panelClass: 'custom-modal'
    }).afterClosed().pipe(take(1)).subscribe(confirmed => {
      if (confirmed) {
        this.proceedDeleteSelectedLogins();
      }
    });
  }

  proceedDeleteSelectedLogins(): void {
    this.startLoading();
    this.loginService.deleteLogins$({ ids: this.selectedLogins.map(login => login.id) }).pipe(take(1)).subscribe({
      next: (deletedCount: number) => {
        this.onDeleteLoginsSuccess(deletedCount);
      },
      error: (error: any) => {
        this.stopLoading();
        console.error('Error permanently deleting logins:', error);
        this.displayError('Failed to permanently delete logins', error);
      }
    });
  }

  onDeleteLoginsSuccess(deletedCount: number): void {
    this.allDeletedLogins = this.allDeletedLogins.filter(login => !this.selectedLogins.includes(login));
    this.setDisplayedLogins();
    this.clearSelection();
    this.stopLoading();
  }

  search(value: string) {
    this.searchValue = value;
    if (this.searchValue.trim() === '') {
      this.setDisplayedLogins();
    } else {
      this.displayedLogins = this.allDeletedLogins.filter(login => {
        const title = login.decryptedData?.title || '';
        return title.toLowerCase().includes(this.searchValue.toLowerCase());
      });
    }
  }

  clearSearch() {
    this.searchValue = '';
    this.setDisplayedLogins();
  }

  clearSelection() {
    this.selectedLogins.forEach(login => login.selected = false);
    this.selectedLogins = [];
  }
}
