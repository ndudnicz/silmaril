import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { BaseComponent } from '../base-component/base-component.component';
import { Credential } from '../../entities/credential';
import { catchError, from, Observable, switchMap, take } from 'rxjs';
import { DataService } from '../../services/data.service';
import { CardStacksComponent } from '../card-stacks/card-stacks.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CredentialService } from '../../services/credential.service';
import { ConfirmModalComponent } from '../modals/confirm-modal/confirm-modal.component';
import { VaultService } from '../../services/vault.service';
import { RestoreLoginsModalComponent } from './modals/restore-logins/restore-logins-modal.component';
import { UpdateCredentialDto } from '../../entities/update/update-credential-dto';
import { DialogService } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';

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
  ],
  templateUrl: './recycle-bin.component.html',
  styleUrl: './recycle-bin.component.css',
})
export class RecycleBinComponent extends BaseComponent implements OnInit {
  private readonly dataService = inject(DataService);
  private readonly loginService = inject(CredentialService);
  private readonly vaultService = inject(VaultService);
  private readonly dialogService = inject(DialogService);
  protected readonly searchValue = signal('');
  protected readonly searchBarPlaceholder = 'Search in Recycle Bin';
  protected readonly allDeletedCredentials = signal<Credential[]>([]);
  protected readonly displayedCredentials = computed(() =>
    this.allDeletedCredentials().filter(
      (login) =>
        login.deleted &&
        (login.decryptedData?.title.toLowerCase().includes(this.searchValue().toLowerCase()) ||
          this.searchValue().trim() === ''),
    ),
  );
  protected readonly selected = signal([] as Credential[]);
  protected readonly vaults = computed(() => this.dataService.getVaults());

  ngOnInit(): void {
    this.loadDeletedCredentials();
  }

  private loadDeletedCredentials(): void {
    this.getDecryptedDeletedCredentials$()
      .pipe(take(1))
      .subscribe((deletedCredentials) => {
        this.allDeletedCredentials.set(deletedCredentials);
      });
  }

  getDecryptedDeletedCredentials$(): Observable<Credential[]> {
    this.startLoading();
    return this.loginService.getDeletedCredentials$().pipe(
      take(1),
      switchMap((logins) => from(this.vaultService.decryptAllCredentialsAsync(logins))),
      switchMap((decryptedLogins) => {
        this.stopLoading();
        return from([decryptedLogins.filter((login) => login.deleted)]);
      }),
      catchError((error) => {
        this.stopLoading();
        this.displayError('Failed to load deleted logins', error);
        return from([[] as Credential[]]);
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

  restoreSelectedLogins(): void {
    const orphanedLogins = this.selected().filter(
      (login) => !this.vaults().some((vault) => vault.id === login.vaultId),
    );
    if (orphanedLogins.length > 0) {
      this.openRestoreLoginsModal(orphanedLogins);
    } else {
      this.openConfirmRestoreLoginsModal();
    }
  }

  openRestoreLoginsModal(orphanedLogins: Credential[]): void {
    this.dialogService
      .open(RestoreLoginsModalComponent, {
        data: {
          orphanedLogins: orphanedLogins,
        },
        width: '450px',
        height: 'auto',
        closable: true,
      })
      ?.onClose.pipe(take(1))
      .subscribe((destinationVaultId) => {
        if (destinationVaultId) {
          this.proceedRestoreSelectedLogins(destinationVaultId);
        }
      });
  }

  openConfirmRestoreLoginsModal(): void {
    this.dialogService
      .open(ConfirmModalComponent, {
        data: {
          title: 'Confirm Restore Logins',
          message: `Are you sure you want to restore ${this.selected.length} logins?`,
          confirmText: 'Restore',
          cancelText: 'Cancel',
        },
        width: '400px',
        height: 'auto',
        closable: true,
      })
      ?.onClose.pipe(take(1))
      .subscribe((confirmed) => {
        if (confirmed) {
          this.proceedRestoreSelectedLogins(null);
        }
      });
  }

  proceedRestoreSelectedLogins(destinationVaultId: string | null): void {
    this.startLoading();
    this.selected.set(
      this.selected().map((login) => {
        login.vaultId = destinationVaultId ?? login.vaultId;
        login.deleted = false;
        return login;
      }),
    );
    this.loginService
      .updateCredentials$(this.selected().map((login) => UpdateCredentialDto.fromCredential(login)))
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.onRestoreLoginSuccess();
        },
        error: (error: unknown) => {
          this.stopLoading();
          this.displayError('Failed to restore logins', error);
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

  confirmDeleteSelectedLogins(): void {
    this.dialogService
      .open(ConfirmModalComponent, {
        closable: true,

        data: {
          title: 'Confirm Permanent Deletion',
          message: `Are you sure you want to permanently delete ${this.selected.length} logins? This action cannot be undone.`,
          confirmText: 'Permanently Delete',
          cancelText: 'Cancel',
        },
      })
      ?.onClose.pipe(take(1))
      .subscribe((confirmed) => {
        if (confirmed) {
          this.proceedDeleteSelectedLogins();
        }
      });
  }

  proceedDeleteSelectedLogins(): void {
    this.startLoading();
    this.loginService
      .deleteCredentials$({ ids: this.selected().map((login) => login.id) })
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.stopLoading();
          this.onDeleteLoginsSuccess();
        },
        error: (error: unknown) => {
          this.stopLoading();
          console.error('Error permanently deleting logins:', error);
          this.displayError('Failed to permanently delete logins', error);
        },
      });
  }

  onDeleteLoginsSuccess(): void {
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
