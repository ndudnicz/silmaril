import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { VaultService } from '../../services/vault.service';
import { Router, RouterLink } from '@angular/router';
import { BaseComponent } from '../base-component/base-component.component';
import { DataService } from '../../services/data.service';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ToastWrapper } from '../../utils/toast.wrapper';
import { take } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
  ],
  templateUrl: './unlock.component.html',
})
export class UnlockComponent extends BaseComponent implements OnInit {
  private readonly dataService = inject(DataService);
  private readonly router = inject(Router);
  private readonly vaultService = inject(VaultService);
  protected readonly masterPasswordFormControl = new FormControl('', [Validators.required]);
  protected readonly form: FormGroup = new FormGroup({
    password: this.masterPasswordFormControl,
  });

  ngOnInit() {
    if (this.vaultService.isUnlocked()) {
      this.router.navigate(['/vault']);
    }
  }

  async onSubmit() {
    this.startLoading();
    this.vaultService
      .setKey$(this.masterPasswordFormControl.value!)
      .pipe(take(1))
      .subscribe({
        next: () => {
          ToastWrapper.success('Vault unlocked successfully');
          this.stopLoading();
          this.router.navigate(['/vault']);
        },
        error: (error: unknown) => {
          this.displayError('Failed to unlock vault', error);
          this.stopLoading();
        },
      });
  }

  keypress(event: KeyboardEvent) {
    if (this.masterPasswordFormControl.valid && event.key === 'Enter') {
      event.stopImmediatePropagation();
      event.preventDefault();
      this.onSubmit();
    }
  }

  // loadVaults(): void {
  //   this.vaultService
  //     .getVaults$()
  //     .pipe(take(1))
  //     .subscribe({
  //       next: (vaults: Vault[]) => {
  //         this.onVaultsLoaded(vaults);
  //       },
  //       error: (error: unknown) => {
  //         this.displayError('Error fetching vaults', error);
  //         this.stopLoading();
  //       },
  //       complete: () => {
  //         console.log('Vaults fetched successfully');
  //         this.stopLoading();
  //       },
  //     });
  // }

  // onVaultsLoaded(vaults: Vault[]): void {
  //   console.log('Vaults fetched successfully:', vaults);
  //   // this.dataService.setVaults(vaults);
  //   if (vaults.length === 0) {
  //     this.displayError('No vaults found. Please create a vault first.', null);
  //     return;
  //   } else {
  //     ToastWrapper.success('Vault unlocked successfully');
  //     this.stopLoading();
  //     this.router.navigate(['/vault']);
  //   }
  // }
}
