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
import { Login, UpdateLoginDto } from '../../entities/login';
import { CommonModule, KeyValue } from '@angular/common';
import { CardStackComponent } from './card-stack/card-stack.component';
import { DataService } from '../../services/data.service';
import { SelectedLoginComponent } from "./selected-login/selected-login.component";
import { MatTooltipModule } from '@angular/material/tooltip';
import { ChangeMasterPasswordModalComponent } from './modals/change-master-password-modal/change-master-password-modal.component';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BaseComponent } from '../base-component/base-component.component';
import { Subscription, take } from 'rxjs';
import { Vault } from '../../entities/vault';
import { ActivatedRoute, Params } from '@angular/router';
import { truncateString } from '../../utils/string.utils';

@Component({
  selector: 'app-vault',
  imports: [
    MatGridListModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    CardStackComponent,
    CommonModule,
    SelectedLoginComponent,
    MatTooltipModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule
  ],
  templateUrl: './vault.component.html',
  styleUrl: './vault.component.css'
})
export class VaultComponent extends BaseComponent implements OnInit, OnDestroy {

  allLogins: Login[] = [];
  displayedLogins: Login[] = [];
  displayedLoginStackEntries: KeyValue<string, Login[]>[] = [];
  selectedLogin: Login | null = null;
  searchValue = '';
  vaultId: string | null = null;
  selectedVault: Vault | null = null;
  subscription: Subscription = new Subscription();
  searchBarPlaceholder = 'Search in Vault';
  readonly searchBarPlaceholderMaxLength = 30;

  constructor(
    private vaultService: VaultService,
    private loginService: LoginService,
    private dataService: DataService,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
  ) {
    super(inject(NgxSpinnerService));
    // this.setupSubscriptionsAndSetupVault();
    // console.log('VaultComponent initialized');
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
      this.selectedLogin = login;
    }));

    this.subscription.add(this.dataService.deletedLogin.subscribe((login: Login | null) => {
      if (login) {
        this.allLogins = this.allLogins.filter(l => l.id !== login.id);
        this.setDisplayedLogins();
        this.computeStacks();
        ToastWrapper.success('Login deleted successfully');
      }
    }));

    this.subscription.add(this.dataService.updatedLogin.subscribe((login: Login | null) => {
      if (login) {
        const index = this.allLogins.findIndex(l => l.id === login.id);
        if (index !== -1) {
          this.allLogins[index] = login;
          this.setDisplayedLogins();
          this.computeStacks();
          ToastWrapper.success('Login updated successfully');
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
      this.searchBarPlaceholder = `Search in ${truncateString(this.selectedVault?.name || 'Vault', this.searchBarPlaceholderMaxLength)}`;
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
    this.loginService.getLogins$().pipe(take(1)).subscribe({
      next: async (logins: Login[]) => {
        console.log('Logins fetched successfully:', logins);
        this.allLogins = await this.vaultService.decryptAllLoginsAsync(logins);
        this.setupDataAndDisplay();
        this.stopLoading();
      },
      error: (error: any) => {
        this.displayError('Error fetching logins', error);
        this.stopLoading();
      }
    });
  }

  setupDataAndDisplay() {
    this.setDisplayedLogins();
    this.computeStacks();
    this.setRecycleBinLogins();
  }

  setDisplayedLogins() {
    this.displayedLogins = this.allLogins.filter(login => !login.deleted && login.vaultId === this.vaultId);
  }

  computeStacks() {
    let loginStacks: any = {};
    for (const login of this.displayedLogins) {
      const stackName = login.decryptedData?.title.charAt(0).toLocaleUpperCase() || 'Uncategorized';
      if (!loginStacks[stackName]) {
        loginStacks[stackName] = [];
      }
      loginStacks[stackName].push(login);
    }
    this.displayedLoginStackEntries = Object.entries(loginStacks as Record<string, Login[]>)
      .map(([key, value]) => ({ key, value }));
    this.displayedLoginStackEntries.sort((a, b) => a.key.localeCompare(b.key));
  }

  setRecycleBinLogins() {
    this.dataService.setRecycleBinLogins(this.allLogins.filter(login => login.vaultId == null || login.deleted));
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
        this.displayedLogins.push(result);
        this.computeStacks();
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
    this.vaultService.clearKey();
    await this.vaultService.setKeyAsync(newMasterPassword);
    this.dataService.setSelectedLogin(null);
    this.allLogins = await this.vaultService.encryptAllLoginsAsync(this.allLogins);
    this.loginService.updateLoginsBulk$(this.allLogins.map(l => UpdateLoginDto.fromLogin(l))).pipe(take(1)).subscribe({
      next: async (updatedLogins: Login[]) => {
        this.onUpdateLoginsSuccess(updatedLogins);
      },
      error: (error: any) => {
        this.displayError('Error while changing master password', error);
        this.stopLoading();
      }
    });
  }

  async onUpdateLoginsSuccess(updatedLogins: Login[]) {
    console.log('All logins updated successfully');
    updatedLogins = await this.vaultService.decryptAllLoginsAsync(updatedLogins);
    this.allLogins = updatedLogins;
    this.setDisplayedLogins();
    this.computeStacks();
    this.setRecycleBinLogins();
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
    this.computeStacks();
  }

  clearSearch() {
    this.searchValue = '';
    this.setDisplayedLogins();
    this.computeStacks();
  }
}
