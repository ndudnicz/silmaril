import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxSpinnerService } from "ngx-spinner";
import { ReactiveFormsModule } from '@angular/forms'; // ⬅️ nécessaire pour formGroup
import { VaultService } from '../../services/vault.service';

@Component({
  selector: 'app-home',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatDividerModule
  ],
  templateUrl: './unlock.component.html',
  styleUrl: './unlock.component.css'
})
export class UnlockComponent {
  masterPasswordFormControl = new FormControl('', [Validators.required, Validators.minLength(8)]);
  form: FormGroup = new FormGroup({
    password: this.masterPasswordFormControl
  });
  loading = false;

  constructor(
    private vaultService: VaultService
  ) { }

  onSubmit() {
    this.loading = true;
    console.log('Form submitted:', this.form.value);
    this.vaultService.setMasterPassword(this.masterPasswordFormControl.value!);
    let key = this.vaultService.getKey();
    console.log('Master password set:', key?.algorithm);
    
    // Handle form submission logic here
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
