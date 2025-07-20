import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { BaseModalComponent } from '../../../../base-component/modal/base-modal/base-modal.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { ImportExportFormat } from '../../../../../entities/import-export/import-export';
import { MatInputModule } from '@angular/material/input';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-export-modal',
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatRadioModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule
  ],
  templateUrl: './export-modal.component.html',
  styleUrl: './export-modal.component.css'
})
export class ExportModalComponent extends BaseModalComponent implements OnDestroy {

  ImportExportFormat = ImportExportFormat;
  subscription: Subscription = new Subscription();

  form: FormGroup = new FormGroup({
    exportFormat: new FormControl(ImportExportFormat.JSON),
    encryptionPassword: new FormControl('', [Validators.required])
  });

  constructor() {
    super(
      inject(MatDialogRef<ExportModalComponent>),
      inject(NgxSpinnerService)
    );

    this.subscription.add(this.form.get('exportFormat')?.valueChanges.subscribe((value) => {
      console.log('Export format changed:', value);
      const passwordControl = this.form.get('encryptionPassword');
      if (value === ImportExportFormat.JSON) {
        this.form.get('encryptionPassword')?.setValidators([Validators.required]);
      } else {
        this.form.get('encryptionPassword')?.clearValidators();
      }
      passwordControl?.updateValueAndValidity();
    }));
  }

  ngOnDestroy(): void {
    this.form.reset();
    this.subscription.unsubscribe();
  }

  onSubmit() {
    if (this.form.valid) {
      this.dialogRef.close({
        exportFormat: this.form.get('exportFormat')?.value,
        encryptionPassword: this.form.get('encryptionPassword')?.value
      } as { exportFormat: string, encryptionPassword?: string });
    } else {
      console.error('Form is invalid:', this.form.errors);
    }
  }

  keypress(event: KeyboardEvent) {
    if (this.form.valid
      && event.key === 'Enter') {
      event.stopImmediatePropagation();
      event.preventDefault();
      this.onSubmit();
    }
  }
}
