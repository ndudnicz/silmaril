import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { BaseComponent } from '../base-component/base-component.component';
import { Credential } from '../../entities/credential';
import { Observable, switchMap, take } from 'rxjs';
import { CardStacksComponent } from '../card-stacks/card-stacks.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CredentialService } from '../../services/credential.service';
import { ConfirmModalComponent } from '../modals/confirm-modal/confirm-modal.component';
import { VaultService } from '../../services/vault.service';
import { RestoreCredentialsModalComponent } from './modals/restore-credentials/restore-credentials-modal.component';
import { UpdateCredentialDto } from '../../entities/update/update-credential-dto';
import { DialogService } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-recycle-bin',
  imports: [
    CardStacksComponent,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    TooltipModule,
    RouterLink,
  ],
  templateUrl: './recycle-bin.component.html',
})
export class RecycleBinComponent extends BaseComponent implements OnInit {
  private readonly vaultService = inject(VaultService);
  private readonly dialogService = inject(DialogService);
  private readonly credentialService = inject(CredentialService);
  protected readonly searchValue = signal('');
  protected readonly searchBarPlaceholder = 'Search in Recycle Bin';
  protected readonly allDeletedCredentials = signal<Credential[]>([]);
  protected readonly displayedCredentials = computed(() =>
    this.allDeletedCredentials().filter(
      (credential) =>
        credential.decryptedData?.title.toLowerCase().includes(this.searchValue().toLowerCase()) ||
        this.searchValue().trim() === '',
    ),
  );
  protected readonly selected = signal([] as Credential[]);
  protected readonly vaults = toSignal(this.vaultService.getVaults$(), { initialValue: [] });

  ngOnInit(): void {
    this.loadCredentials();
  }

  loadCredentials(): void {
    this.startLoading();
    this.getDecryptedCredentials$()
      .pipe(take(1))
      .subscribe({
        next: (credentials: Credential[]) => {
          console.log('Credentials fetched successfully:', credentials);
          this.allDeletedCredentials.set(credentials.filter((credential) => credential.deleted));
          this.stopLoading();
        },
        error: (error: unknown) => {
          this.displayError('Error fetching credentials', error);
          this.stopLoading();
        },
      });
  }

  getDecryptedCredentials$(): Observable<Credential[]> {
    return this.credentialService.getDeletedCredentials$().pipe(
      take(1),
      switchMap((credentials) => {
        console.log('Credentials fetched from service:', credentials);
        return this.vaultService.decryptAllCredentials$(credentials);
      }),
    );
  }

  select(login: Credential): void {
    if (this.selected().includes(login)) {
      this.selected.set(this.selected().filter((l) => l !== login));
    } else {
      this.selected.set([...this.selected(), login]);
    }
    login.selected = !login.selected;
  }

  restoreSelectedCredentials(): void {
    console.log('Attempting to restore selected credentials:', this.selected());

    const orphanedCredentials = this.selected().filter(
      (login) => !this.vaults().some((vault) => vault.id === login.vaultId),
    );
    if (orphanedCredentials.length > 0) {
      this.openRestoreOrphanedCredentialsModal(orphanedCredentials);
    } else {
      this.openConfirmRestoreCredentialsModal();
    }
  }

  openRestoreOrphanedCredentialsModal(orphanedCredentials: Credential[]): void {
    this.dialogService
      .open(RestoreCredentialsModalComponent, {
        header: 'Restore orphaned credentials',
        data: {
          orphanedCredentials: orphanedCredentials,
          vaults: this.vaults(),
        },
        width: '450px',
        height: 'auto',
        closable: true,
      })
      ?.onClose.pipe(take(1))
      .subscribe((destinationVaultId) => {
        if (destinationVaultId) {
          this.proceedRestoreSelectedCredentials(destinationVaultId);
        }
      });
  }

  openConfirmRestoreCredentialsModal(): void {
    console.log('restoring ', this.selected());

    this.dialogService
      .open(ConfirmModalComponent, {
        header: 'Confirm restore credentials',
        closable: false,
        data: {
          message: `Are you sure you want to restore ${this.selected().length} credentials?`,
          confirmText: 'Restore',
          cancelText: 'Cancel',
        },
        width: '400px',
        height: 'auto',
      })
      ?.onClose.pipe(take(1))
      .subscribe((confirmed) => {
        if (confirmed) {
          this.proceedRestoreSelectedCredentials(null);
        }
      });
  }

  proceedRestoreSelectedCredentials(destinationVaultId: string | null): void {
    this.startLoading();
    this.selected.set(
      this.selected().map((login) => {
        login.vaultId = destinationVaultId ?? login.vaultId;
        login.deleted = false;
        return login;
      }),
    );
    this.credentialService
      .updateCredentials$(this.selected().map((login) => UpdateCredentialDto.fromCredential(login)))
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.onRestoreLoginSuccess();
        },
        error: (error: unknown) => {
          this.stopLoading();
          this.displayError('Failed to restore credentials', error);
        },
      });
  }

  onRestoreLoginSuccess(): void {
    this.allDeletedCredentials.set(
      this.allDeletedCredentials().filter((login) => !this.selected().includes(login)),
    );
    this.clearSelection();
    this.stopLoading();
  }

  confirmDeleteSelectedCredentials(): void {
    this.dialogService
      .open(ConfirmModalComponent, {
        header: 'Confirm permanent deletion',
        closable: false,
        data: {
          message: `Are you sure you want to permanently delete ${this.selected.length} credentials? This action cannot be undone.`,
          confirmText: 'Permanently Delete',
          cancelText: 'Cancel',
        },
      })
      ?.onClose.pipe(take(1))
      .subscribe((confirmed) => {
        if (confirmed) {
          this.proceedDeleteSelectedCredentials();
        }
      });
  }

  proceedDeleteSelectedCredentials(): void {
    this.startLoading();
    this.credentialService
      .deleteCredentials$({ ids: this.selected().map((login) => login.id) })
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.stopLoading();
          this.onDeleteCredentialsSuccess();
        },
        error: (error: unknown) => {
          this.stopLoading();
          console.error('Error permanently deleting credentials:', error);
          this.displayError('Failed to permanently delete credentials', error);
        },
      });
  }

  onDeleteCredentialsSuccess(): void {
    this.allDeletedCredentials.set(
      this.allDeletedCredentials().filter((login) => !this.selected().includes(login)),
    );
    this.clearSelection();
  }

  clearSearch() {
    this.searchValue.set('');
  }

  clearSelection() {
    this.selected().forEach((login) => (login.selected = false));
    this.selected.set([]);
  }
}
