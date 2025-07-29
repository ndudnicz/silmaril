import { Component, ElementRef, inject, input, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { NgxSpinnerService } from 'ngx-spinner';
import { BaseModalComponent } from '../../../../base-component/modal/base-modal/base-modal.component';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-import-modal',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule
  ],
  templateUrl: './import-modal.component.html',
  styleUrl: './import-modal.component.css'
})
export class ImportModalComponent extends BaseModalComponent {

  form = new FormGroup({
  });

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  fileName: string | null = null;

  constructor() {
    super(
      inject(MatDialogRef<ImportModalComponent>),
      inject(NgxSpinnerService)
    );
  }

  ngOnDestroy(): void {
    this.form.reset();
  }


  onSubmit() {
    if (this.form.valid) {
      // TODO: Implement the import logic here
    } else {
      console.error('Form is invalid:', this.form.errors);
    }
  }

  onImport() {
    // Logic for handling import action
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.fileName = input.files[0].name;
    }
  }
}
