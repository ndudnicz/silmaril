import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxSpinnerService } from "ngx-spinner";
import { ReactiveFormsModule } from '@angular/forms';
import { VaultService } from '../../services/vault.service';
import { Router, RouterLink } from '@angular/router';
import { ToastWrapper } from '../../utils/toast.wrapper';
import { BaseComponent } from '../base-component/base-component.component';
import { take } from 'rxjs';
import { Vault } from '../../entities/vault';
import { DataService } from '../../services/data.service';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatDividerModule,
    RouterLink
  ],
  templateUrl: './unlock.component.html',
  styleUrl: './unlock.component.css'
})
export class UnlockComponent extends BaseComponent implements OnInit {
  masterPasswordFormControl = new FormControl('', [Validators.required, Validators.minLength(8)]);
  form: FormGroup = new FormGroup({
    password: this.masterPasswordFormControl
  });

  constructor(
    private vaultService: VaultService,
    private router: Router,
    private dataService: DataService,
  ) {
    super(inject(NgxSpinnerService));
  }

  ngOnInit() {
    if (this.vaultService.isUnlocked()) {
      this.router.navigate(['/vault']);
    }
  }

  async onSubmit() {
    try {
      this.startLoading();
      console.log('Form submitted:', this.form.value);
      await this.vaultService.setKeyAsync(this.masterPasswordFormControl.value!);
      this.loadVaults();
    } catch (error: any) {
      this.displayError('Failed to unlock vault', error);
    } finally {
      this.stopLoading();
    }
  }

  keypress(event: KeyboardEvent) {
    if (this.masterPasswordFormControl.valid
      && event.key === 'Enter') {
      event.stopImmediatePropagation();
      event.preventDefault();
      this.onSubmit();
    }
  }

  loadVaults(): void {
    this.vaultService.getVaults$().pipe(take(1)).subscribe({
      next: (vaults: Vault[]) => {
        this.onVaultsLoaded(vaults);
      },
      error: (error: any) => {
        this.displayError('Error fetching vaults', error);
        this.stopLoading();
      },
      complete: () => {
        console.log('Vaults fetched successfully');
        this.stopLoading();
      }
    });
  }

  onVaultsLoaded(vaults: Vault[]): void {
    console.log('Vaults fetched successfully:', vaults);
    this.dataService.setVaults(vaults);
    if (vaults.length === 0) {
      this.displayError('No vaults found. Please create a vault first.', null);
      return;
    } else {
      ToastWrapper.success('Vault unlocked successfully');
      this.stopLoading();
      this.router.navigate(['/vault', vaults[0].id]);
    }
  }
}
