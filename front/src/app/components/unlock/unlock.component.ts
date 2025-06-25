import { Component, OnInit } from '@angular/core';
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
import { Router } from '@angular/router';
import { ToastWrapper } from '../../utils/toast.wrapper';

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
  ],
  templateUrl: './unlock.component.html',
  styleUrl: './unlock.component.css'
})
export class UnlockComponent implements OnInit {
  masterPasswordFormControl = new FormControl('', [Validators.required, Validators.minLength(8)]);
  form: FormGroup = new FormGroup({
    password: this.masterPasswordFormControl
  });
  loading = false;

  constructor(
    private vaultService: VaultService,
    private router: Router,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit() {
    if (this.vaultService.isUnlocked()) {
      this.router.navigate(['/vault']);
    }
  }

  async onSubmit() {
    try {
      this.loading = true;
      this.spinner.show();
      console.log('Form submitted:', this.form.value);
      await this.vaultService.setKeyAsync(this.masterPasswordFormControl.value!);
      ToastWrapper.success('Vault unlocked successfully');
      this.router.navigate(['/vault']);
    } catch (error: any) {
      ToastWrapper.error('Failed to unlock vault: ', error.message ?? error);
    } finally {
      this.loading = false;
      this.spinner.hide();
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
}
