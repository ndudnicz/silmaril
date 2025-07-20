import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { VaultService } from '../../services/vault.service';
import { LoginService } from '../../services/login.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ToastWrapper } from '../../utils/toast.wrapper';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddEditLoginModalComponent } from './modals/add-edit-login/add-edit-login-modal.component';
import { Login } from '../../entities/login';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { SelectedLoginComponent } from "./selected-login/selected-login.component";
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BaseComponent } from '../base-component/base-component.component';
import { from, Observable, Subscription, switchMap, take } from 'rxjs';
import { Vault } from '../../entities/vault';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { truncateString } from '../../utils/string.utils';
import { CardStacksComponent } from '../card-stacks/card-stacks.component';
import { UpdateLoginDto } from '../../entities/update/update-login-dto';
import { EditVaultModalComponent } from './modals/edit-vault-modal/edit-vault-modal.component';
import { ChangeMasterPasswordModalComponent } from './modals/change-master-password-modal/change-master-password-modal.component';
import { ConfirmModalComponent } from '../modals/confirm-modal/confirm-modal.component';
import { EncryptionService } from '../../services/encryption.service';

@Component({
  selector: 'app-vault',
  imports: [
    MatGridListModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    CommonModule,
    SelectedLoginComponent,
    MatTooltipModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    CardStacksComponent
  ],
  templateUrl: './vault.component.html',
  styleUrl: './vault.component.css'
})
export class VaultComponent extends BaseComponent implements OnInit, OnDestroy {

  allLogins: Login[] = [];
  displayedLogins: Login[] = [];
  selectedLogin: Login | null = null;
  searchValue = '';
  vaultId: string | null = null;
  selectedVault: Vault | null = null;
  subscription: Subscription = new Subscription();
  searchBarPlaceholder = 'Search in Vault';

  private readonly searchBarPlaceholderMaxLength = 30;

  constructor(
    private vaultService: VaultService,
    private loginService: LoginService,
    private dataService: DataService,
    private encryptionService: EncryptionService,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private router: Router
  ) {
    super(inject(NgxSpinnerService));
  }

  ngOnInit(): void {
    this.startLoading();
    console.log('Activated Route Data:', this.activatedRoute.snapshot);
    this.setupSubscriptionsAndSetupVault();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  setupSubscriptionsAndSetupVault(): void {
    this.subscription.add(this.dataService.selectedLogin.subscribe((login: Login | null) => {
      if (this.selectedLogin && this.selectedLogin.id !== login?.id) {
        this.selectedLogin!.selected = false;
      }
      this.selectedLogin = login;
      if (this.selectedLogin) {
        this.selectedLogin.selected = true;
      }
    }));

    this.subscription.add(this.dataService.deletedLogin.subscribe((login: Login | null) => {
      if (login) {
        this.allLogins = this.allLogins.filter(l => l.id !== login.id);
        this.setDisplayedLogins();
      }
    }));

    this.subscription.add(this.dataService.updatedLogin.subscribe((login: Login | null) => {
      if (login) {
        const index = this.allLogins.findIndex(l => l.id === login.id);
        if (index !== -1) {
          this.allLogins[index] = login;
          this.setDisplayedLogins();
        } else {
          console.warn('Updated login not found in current logins:', login);
        }
      }
    }));

    this.subscription.add(this.activatedRoute.params.subscribe(params => {
      this.setupVault(params);
    }));
  }

  setupVault(params: Params): void {
    this.startLoading();
    console.log('Route params:', params);
    this.vaultId = params['id'] || null;

    if (this.vaultId) {
      this.dataService.setSelectedLogin(null);
      this.selectedVault = this.dataService.getVaults()?.find(v => v.id === this.vaultId) || null;
      console.log('Selected Vault:', this.selectedVault);
      this.setSearchBarPlaceholder();
      if (this.allLogins.length > 0) {
        this.setupDataAndDisplay();
        this.stopLoading();
        return;
      }
      this.loadLogins();
    }
    else {
      this.displayError('Vault ID not found in route data', null);
      this.stopLoading();
      return;
    }
  }

  loadLogins(): void {
    this.startLoading();
    this.getDecryptedLogins$().pipe(take(1)).subscribe({
      next: async (logins: Login[]) => {
        console.log('Logins fetched successfully:', logins);
        this.allLogins = logins;
        this.setupDataAndDisplay();
        this.stopLoading();
      },
      error: (error: any) => {
        this.displayError('Error fetching logins', error);
        this.stopLoading();
      }
    })
  }

  getDecryptedLogins$(): Observable<Login[]> {
    return this.loginService.getLogins$()
      .pipe(
        take(1),
        switchMap(logins => {
          return from(this.encryptionService.decryptAllLoginsAsync(logins, this.vaultService.getDerivedKey()));
        })
      );
  }

  setupDataAndDisplay() {
    this.setDisplayedLogins();
  }

  setDisplayedLogins() {
    this.displayedLogins = this.allLogins.filter(login => login.vaultId === this.vaultId && !login.deleted);
    console.log('Setting displayed logins for vault:', this.displayedLogins);
  }

  openAddLoginModal() {
    this.dialog.open(AddEditLoginModalComponent,
      {
        panelClass: 'custom-modal',
        width: '600px',
        height: 'auto',
        closeOnNavigation: false,
        disableClose: true,
        autoFocus: true,
        data: {
          mode: AddEditLoginModalComponent.MODAL_MOD.ADD,
          login: null,
          vaultId: this.vaultId
        }
      }
    ).afterClosed().pipe(take(1)).subscribe(async (result: Login) => {
      if (result) {
        this.allLogins.push(result);
        this.displayedLogins = [...this.displayedLogins, result];
      }
    });
  }

  openChangeMasterPasswordModal() {
    this.dialog.open(ChangeMasterPasswordModalComponent,
      {
        panelClass: 'custom-modal',
        width: '400px',
        height: 'auto',
        closeOnNavigation: false,
        disableClose: true,
        autoFocus: true
      }
    ).afterClosed().pipe(take(1)).subscribe(async (newMasterPassword: string) => {
      if (newMasterPassword != null) {
        await this.changeMasterPassword(newMasterPassword);
      }
    });
  }

  private async changeMasterPassword(newMasterPassword: string) {
    this.startLoading();
    const deletedLogins = await this.getDeletedLoginsAsync();
    this.vaultService.clearDerivedKey();
    await this.vaultService.deriveAndSetDerivedKeyAsync(newMasterPassword);
    this.dataService.setSelectedLogin(null);
    this.allLogins = await this.encryptionService.encryptAllLoginsAsync([
      ...this.allLogins, ...deletedLogins
    ], this.vaultService.getDerivedKey());
    this.loginService.updateLogins$(this.allLogins.map(l => UpdateLoginDto.fromLogin(l))).pipe(take(1)).subscribe({
      next: async (updatedLogins: Login[]) => {
        this.onUpdateLoginsSuccess(updatedLogins);
      },
      error: (error: any) => {
        this.displayError('Error while changing master password', error);
        this.stopLoading();
      }
    });
  }

  private async getDeletedLoginsAsync(): Promise<Login[]> {
    return new Promise<Login[]>(async (resolve, reject) => {
      this.startLoading();
      this.loginService.getDeletedLogins$().pipe(
        take(1),
        switchMap(deletedLogins => from(this.encryptionService.decryptAllLoginsAsync(deletedLogins, this.vaultService.getDerivedKey())))
      ).subscribe({
        next: (deletedLogins: Login[]) => {
          this.stopLoading();
          resolve(deletedLogins);
        },
        error: (error: any) => {
          this.stopLoading();
          reject(error);
        }
      });
    });
  }

  private async onUpdateLoginsSuccess(updatedLogins: Login[]) {
    updatedLogins = await this.encryptionService.decryptAllLoginsAsync(updatedLogins, this.vaultService.getDerivedKey());
    this.allLogins = updatedLogins;
    this.setDisplayedLogins();
    this.stopLoading();
    ToastWrapper.success('Master password changed successfully');
  }

  search(value: string) {
    this.searchValue = value;
    if (this.searchValue.trim() === '') {
      this.setDisplayedLogins();
    } else {
      this.displayedLogins = this.allLogins.filter(login => {
        const title = login.decryptedData?.title || '';
        return !login.deleted
          && login.vaultId == this.vaultId
          && title.toLowerCase().includes(this.searchValue.toLowerCase());
      });
    }
  }

  clearSearch() {
    this.searchValue = '';
    this.setDisplayedLogins();
  }

  setSelectedLogin(login: Login | null) {
    if (this.selectedLogin === null || this.selectedLogin.id !== login?.id) {
      this.dataService.setSelectedLogin(login)
    }
  }

  setSearchBarPlaceholder() {
    this.searchBarPlaceholder = `Search in ${truncateString(this.selectedVault!.name, this.searchBarPlaceholderMaxLength)}`;
  }

  openEditVaultModal() {
    this.dialog.open(EditVaultModalComponent, {
      panelClass: 'custom-modal',
      width: '400px',
      height: 'auto',
      closeOnNavigation: false,
      disableClose: true,
      autoFocus: true,
      data: {
        vaultName: this.selectedVault!.name
      }
    }).afterClosed().pipe(take(1)).subscribe((newVaultName: string | null) => {
      if (newVaultName !== null && newVaultName !== this.selectedVault?.name) {
        this.updateVaultName(newVaultName);
      }
    });
  }

  updateVaultName(newVaultName: string) {
    this.startLoading();
    this.vaultService.updateVault$({
      id: this.selectedVault!.id,
      name: newVaultName
    }).pipe(take(1)).subscribe({
      next: (updatedVault: Vault) => {
        this.onVaultUpdateSuccess(updatedVault);
      },
      error: (error: any) => {
        this.displayError('Error updating vault', error);
      },
      complete: () => {
        this.stopLoading();
      }
    });
  }

  onVaultUpdateSuccess(updatedVault: Vault) {
    console.log('Vault updated successfully:', updatedVault);
    this.selectedVault = updatedVault;
    this.dataService.updateVault(updatedVault);
    this.setSearchBarPlaceholder();
    ToastWrapper.success('Vault updated successfully');
    this.stopLoading();
  }

  openDeleteVaultModal() {
    this.dialog.open(ConfirmModalComponent, {
      panelClass: 'custom-modal',
      width: 'auto',
      height: 'auto',
      closeOnNavigation: false,
      disableClose: true,
      autoFocus: true,
      data: {
        title: 'Delete Vault',
        message: `Are you sure you want to delete the vault "${this.selectedVault?.name}"? This action cannot be undone. The vault's logins will be sent to the recycle bin.`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    }).afterClosed().pipe(take(1)).subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.deleteVaultModal();
      }
    });
  }

  deleteVaultModal() {
    this.startLoading();
    this.vaultService.deleteVault$(this.selectedVault!.id).pipe(take(1)).subscribe({
      next: (deletedVaultNumber: number) => {
        this.onVaultDeleteSuccess();
      },
      error: (error: any) => {
        this.displayError('Error deleting vault', error);
        this.stopLoading();
      }
    });
  }

  onVaultDeleteSuccess() {
    const vaults = this.dataService.getVaults().filter(v => v.id !== this.selectedVault!.id);
    this.dataService.setVaults(vaults);
    this.dataService.setSelectedLogin(null);
    this.allLogins = [];
    this.stopLoading();
    ToastWrapper.success(`Vault "${this.selectedVault?.name}" deleted successfully`);
    this.router.navigate(['/vault', vaults[0]?.id]);
  }
}
