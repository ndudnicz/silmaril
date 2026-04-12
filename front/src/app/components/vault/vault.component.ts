import { Component, computed, inject, signal } from '@angular/core';
import { VaultService } from '../../services/vault.service';
import { CredentialService } from '../../services/credential.service';
import { ToastWrapper } from '../../utils/toast.wrapper';
import { Credential } from '../../entities/credential';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BaseComponent } from '../base-component/base-component.component';
import { from, Observable, Subscription, switchMap, take } from 'rxjs';
import { Vault } from '../../entities/vault';
import { ActivatedRoute, Router } from '@angular/router';
import { truncateString } from '../../utils/string.utils';
import { CardStacksComponent } from '../card-stacks/card-stacks.component';
import { UpdateCredentialDto } from '../../entities/update/update-credential-dto';
import { EditVaultModalComponent } from './modals/edit-vault-modal/edit-vault-modal.component';
import { ChangeMasterPasswordModalComponent } from './modals/change-master-password-modal/change-master-password-modal.component';
import { ConfirmModalComponent } from '../modals/confirm-modal/confirm-modal.component';
import { DialogService } from 'primeng/dynamicdialog';
import { DrawerModule } from 'primeng/drawer';
import { AddEditCredentialModalComponent } from './modals/add-edit-credential/add-edit-credential-modal.component';
import { SelectedCredentialComponent } from './selected-credential/selected-credential.component';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-vault',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CardStacksComponent,
    DrawerModule,
    SelectedCredentialComponent,
    ButtonModule,
    TooltipModule,
    InputTextModule,
  ],
  templateUrl: './vault.component.html',
  styleUrl: './vault.component.css',
})
export class VaultComponent extends BaseComponent {
  private readonly vaultService = inject(VaultService);
  private readonly credentialService = inject(CredentialService);
  private readonly dataService = inject(DataService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly dialogService = inject(DialogService);
  private readonly router = inject(Router);

  protected allCredentials = signal<Credential[]>([]);
  protected readonly displayedCredentials = computed(() =>
    this.allCredentials().filter(
      (credential) => credential.vaultId === this.vaultId() && !credential.deleted,
    ),
  );
  protected readonly selectedCredential = signal<Credential | null>(null);
  protected readonly showDrawer = computed(() => this.selectedCredential() !== null);
  protected readonly searchValue = signal<string>('');
  protected vaultId = signal<string | null>(null);
  protected selectedVault = signal<Vault | null>(null);
  protected readonly subscription: Subscription = new Subscription();
  protected readonly searchBarPlaceholder = computed(() =>
    this.selectedVault()
      ? `Search in ${truncateString(this.selectedVault()!.name, this.searchBarPlaceholderMaxLength)}`
      : 'Select a vault to search',
  );

  private readonly searchBarPlaceholderMaxLength = 30;

  // ngOnInit(): void {
  //   this.startLoading();
  //   console.log('Activated Route Data:', this.activatedRoute.snapshot);
  //   // this.setupSubscriptionsAndSetupVault();
  // }

  // ngOnDestroy(): void {
  //   this.subscription.unsubscribe();
  // }

  // setupSubscriptionsAndSetupVault(): void {
  //   this.subscription.add(this.dataService.selectedCredential.subscribe((credential: Credential | null) => {
  //     if (this.selectedCredential && this.selectedCredential.id !== credential?.id) {
  //       this.selectedCredential!.selected = false;
  //     }
  //     this.selectedCredential = credential;
  //     if (this.selectedCredential) {
  //       this.selectedCredential.selected = true;
  //     }
  //   }));

  //   this.subscription.add(this.dataService.deletedCredential.subscribe((credential: Credential | null) => {
  //     if (credential) {
  //       this.allCredentials = this.allCredentials.filter(l => l.id !== credential.id);
  //       this.setDisplayedCredentials();
  //     }
  //   }));

  //   this.subscription.add(this.dataService.updatedCredential.subscribe((credential: Credential | null) => {
  //     if (credential) {
  //       const index = this.allCredentials.findIndex(l => l.id === credential.id);
  //       if (index !== -1) {
  //         this.allCredentials[index] = credential;
  //         this.setDisplayedCredentials();
  //       } else {
  //         console.warn('Updated credential not found in current credentials:', credential);
  //       }
  //     }
  //   }));

  //   this.subscription.add(this.activatedRoute.params.subscribe(params => {
  //     this.setupVault(params);
  //   }));
  // }

  // setupVault(params: Params): void {
  //   this.startLoading();
  //   console.log('Route params:', params);
  //   this.vaultId = params['id'] || null;

  //   if (this.vaultId) {
  //     this.dataService.setSelectedCredential(null);
  //     this.selectedVault = this.dataService.getVaults()?.find(v => v.id === this.vaultId()) || null;
  //     console.log('Selected Vault:', this.selectedVault);
  //     this.setSearchBarPlaceholder();
  //     if (this.allCredentials.length > 0) {
  //       this.setupDataAndDisplay();
  //       this.stopLoading();
  //       return;
  //     }
  //     this.loadCredentials();
  //   }
  //   else {
  //     this.displayError('Vault ID not found in route data', null);
  //     this.stopLoading();
  //     return;
  //   }
  // }

  loadCredentials(): void {
    this.startLoading();
    this.getDecryptedCredentials$()
      .pipe(take(1))
      .subscribe({
        next: async (credentials: Credential[]) => {
          console.log('Credentials fetched successfully:', credentials);
          this.allCredentials.set(credentials);
          // this.setupDataAndDisplay();
          this.stopLoading();
        },
        error: (error: Error) => {
          this.displayError('Error fetching credentials', error);
          this.stopLoading();
        },
      });
  }

  getDecryptedCredentials$(): Observable<Credential[]> {
    return this.credentialService.getCredentials$().pipe(
      take(1),
      switchMap((credentials) => {
        return from(this.vaultService.decryptAllCredentialsAsync(credentials));
      }),
    );
  }

  // setupDataAndDisplay() {
  //   this.setDisplayedCredentials();
  // }

  openAddCredentialModal() {
    this.dialogService
      .open(AddEditCredentialModalComponent, {
        closable: true,

        width: '600px',
        height: 'auto',
        data: {
          mode: AddEditCredentialModalComponent.MODAL_MOD.ADD,
          credential: null,
          vaultId: this.vaultId,
        },
      })
      ?.onClose.pipe(take(1))
      .subscribe(async (result: Credential) => {
        if (result) {
          this.allCredentials.update((credentials) => [...credentials, result]);
        }
      });
  }

  openChangeMasterPasswordModal() {
    this.dialogService
      .open(ChangeMasterPasswordModalComponent, {
        closable: true,

        width: '400px',
        height: 'auto',
      })
      ?.onClose.pipe(take(1))
      .subscribe(async (newMasterPassword: string) => {
        if (newMasterPassword != null) {
          await this.changeMasterPassword(newMasterPassword);
        }
      });
  }

  private async changeMasterPassword(newMasterPassword: string) {
    this.startLoading();
    const deletedCredentials = await this.getDeletedCredentialsAsync();
    this.vaultService.clearKey();
    await this.vaultService.setKeyAsync(newMasterPassword);
    this.allCredentials.set(
      await this.vaultService.encryptAllCredentialsAsync([
        ...this.allCredentials(),
        ...deletedCredentials,
      ]),
    );
    this.credentialService
      .updateCredentials$(this.allCredentials().map((l) => UpdateCredentialDto.fromCredential(l)))
      .pipe(take(1))
      .subscribe({
        next: async (updatedCredentials: Credential[]) => {
          this.onUpdateCredentialsSuccess(updatedCredentials);
        },
        error: (error: Error) => {
          this.displayError('Error while changing master password', error);
          this.stopLoading();
        },
      });
  }

  private async getDeletedCredentialsAsync(): Promise<Credential[]> {
    return new Promise<Credential[]>((resolve, reject) => {
      this.startLoading();
      this.credentialService
        .getDeletedCredentials$()
        .pipe(
          take(1),
          switchMap((deletedCredentials) =>
            from(this.vaultService.decryptAllCredentialsAsync(deletedCredentials)),
          ),
        )
        .subscribe({
          next: (deletedCredentials: Credential[]) => {
            this.stopLoading();
            resolve(deletedCredentials);
          },
          error: (error: Error) => {
            this.stopLoading();
            reject(error);
          },
        });
    });
  }

  private async onUpdateCredentialsSuccess(updatedCredentials: Credential[]) {
    updatedCredentials = await this.vaultService.decryptAllCredentialsAsync(updatedCredentials);
    this.allCredentials.set(updatedCredentials);
    this.stopLoading();
    ToastWrapper.success('Master password changed successfully');
  }

  // search(value: string) {
  //   this.searchValue.set(value.trim());
  //   if (this.searchValue.trim() === '') {
  //     this.setDisplayedCredentials();
  //   } else {
  //     this.displayedCredentials = this.allCredentials.filter(credential => {
  //       const title = credential.decryptedData?.title || '';
  //       return !credential.deleted
  //         && credential.vaultId == this.vaultId
  //         && title.toLowerCase().includes(this.searchValue.toLowerCase());
  //     });
  //   }
  // }

  clearSearch() {
    this.searchValue.set('');
  }

  // setSelectedCredential(credential: Credential | null) {
  //   if (this.selectedCredential === null || this.selectedCredential.id !== credential?.id) {
  //     this.dataService.setSelectedCredential(credential)
  //   }
  // }

  openEditVaultModal() {
    this.dialogService
      .open(EditVaultModalComponent, {
        closable: true,

        width: '400px',
        height: 'auto',
        data: {
          vaultName: this.selectedVault!.name,
        },
      })
      ?.onClose.pipe(take(1))
      .subscribe((newVaultName: string | null) => {
        if (newVaultName !== null && newVaultName !== this.selectedVault?.name) {
          this.updateVaultName(newVaultName);
        }
      });
  }

  updateVaultName(newVaultName: string) {
    const selectedVault = this.selectedVault();
    if (!selectedVault) {
      this.displayError('No vault selected', null);
      return;
    }
    this.startLoading();
    this.vaultService
      .updateVault$({
        id: selectedVault.id,
        name: newVaultName,
      })
      .pipe(take(1))
      .subscribe({
        next: (updatedVault: Vault) => {
          this.onVaultUpdateSuccess(updatedVault);
        },
        error: (error: Error) => {
          this.displayError('Error updating vault', error);
        },
        complete: () => {
          this.stopLoading();
        },
      });
  }

  onVaultUpdateSuccess(updatedVault: Vault) {
    console.log('Vault updated successfully:', updatedVault);
    this.selectedVault.set(updatedVault);
    this.dataService.updateVault(updatedVault);
    ToastWrapper.success('Vault updated successfully');
    this.stopLoading();
  }

  openDeleteVaultModal() {
    this.dialogService
      .open(ConfirmModalComponent, {
        closable: true,

        width: 'auto',
        height: 'auto',
        data: {
          title: 'Delete Vault',
          message: `Are you sure you want to delete the vault "${this.selectedVault?.name}"? This action cannot be undone. The vault's credentials will be sent to the recycle bin.`,
          confirmText: 'Delete',
          cancelText: 'Cancel',
        },
      })
      ?.onClose.pipe(take(1))
      .subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.deleteVaultModal();
        }
      });
  }

  deleteVaultModal() {
    const selectedVault = this.selectedVault();
    if (!selectedVault) {
      this.displayError('No vault selected', null);
      return;
    }
    this.startLoading();
    this.vaultService
      .deleteVault$(selectedVault.id)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.onVaultDeleteSuccess(selectedVault.id);
        },
        error: (error: Error) => {
          this.displayError('Error deleting vault', error);
          this.stopLoading();
        },
      });
  }

  onVaultDeleteSuccess(deletedVaultId: string) {
    const vaults = this.dataService.getVaults().filter((v) => v.id !== deletedVaultId);
    this.dataService.setVaults(vaults);
    this.selectedCredential.set(null);
    this.allCredentials.set([]);
    this.stopLoading();
    ToastWrapper.success(`Vault "${this.selectedVault?.name}" deleted successfully`);
    this.router.navigate(['/vault', vaults[0]?.id]);
  }

  onCredentialUpdated(updatedCredential: Credential) {
    const index = this.allCredentials().findIndex((c) => c.id === updatedCredential.id);
    if (index !== -1) {
      const updatedCredentials = [...this.allCredentials()];
      updatedCredentials[index] = updatedCredential;
      this.allCredentials.set(updatedCredentials);
    } else {
      console.warn('Updated credential not found in current credentials:', updatedCredential);
    }
  }
}
