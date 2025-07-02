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
import { take, takeUntil } from 'rxjs';

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

  readonly dialog = inject(MatDialog);
  allLogins: Login[] = [];
  displayedLogins: Login[] = [];
  displayedLoginStackEntries: KeyValue<string, Login[]>[] = [];
  selectedLogin: Login | null = null;
  searchValue = '';

  constructor(
    private vaultService: VaultService,
    private loginService: LoginService,
    private dataService: DataService
  ) {
    super(inject(NgxSpinnerService));
    this.setupLoginSubscriptions();
    console.log('VaultComponent initialized');
  }

  ngOnInit() {
    this.startLoading();
    this.loginService.getLogins$().pipe(take(1)).subscribe({
      next: async (logins: Login[]) => {
        this.allLogins = await this.vaultService.decryptAllLoginsAsync(logins);
        console.log('Fetched logins:', this.allLogins);
        if (this.allLogins.length === 0) {
          ToastWrapper.info('No logins found. Please add a login.');
        }
        this.setDisplayedLogins();
        this.computeStacks();
      },
      error: (error: any) => {
        ToastWrapper.error('Failed to fetch logins: ', error.message ?? error);
        console.error('Error fetching logins:', error);
        this.stopLoading();
      },
      complete: async () => {
        console.log('All logins fetched successfully');
        this.stopLoading();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setupLoginSubscriptions() {
    this.dataService.selectedLogin.pipe(takeUntil(this.destroy$)).subscribe((login: Login | null) => {
      this.selectedLogin = login;
    });

    this.dataService.deletedLogin.pipe(takeUntil(this.destroy$)).subscribe((login: Login | null) => {
      if (login) {
        this.allLogins = this.allLogins.filter(l => l.id !== login.id);
        this.setDisplayedLogins();
        this.computeStacks();
        ToastWrapper.success('Login deleted successfully');
      }
    });

    this.dataService.updatedLogin.pipe(takeUntil(this.destroy$)).subscribe((login: Login | null) => {
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
    });
  }

  setDisplayedLogins() {
    this.displayedLogins = this.allLogins.filter(login => !login.deleted);
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
          login: null
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
        ToastWrapper.error('Failed to update logins: ', error.message ?? error);
        console.error('Error updating logins:', error);
      }
    });
  }

  async onUpdateLoginsSuccess(updatedLogins: Login[]) {
    console.log('All logins updated successfully');
    updatedLogins = await this.vaultService.decryptAllLoginsAsync(updatedLogins);
    this.allLogins = updatedLogins;
    this.setDisplayedLogins();
    this.computeStacks();
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
        return title.toLowerCase().includes(this.searchValue.toLowerCase());
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
