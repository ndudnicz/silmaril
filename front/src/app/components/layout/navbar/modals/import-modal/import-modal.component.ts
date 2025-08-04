import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { NgxSpinnerService } from 'ngx-spinner';
import { BaseModalComponent } from '../../../../base-component/modal/base-modal/base-modal.component';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ImportExportFormat, ImportExportJson } from '../../../../../entities/import-export/import-export';
import { parse } from 'csv-parse/browser/esm'
import { DecryptedData } from '../../../../../entities/decrypt-data/decrypted-data';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-import-modal',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './import-modal.component.html',
  styleUrl: './import-modal.component.css'
})
export class ImportModalComponent extends BaseModalComponent {

  form = new FormGroup({
    password: new FormControl('', [])
  });
  importFormat: ImportExportFormat | null = null;
  parsedData: any;

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  fileName: string | null = null;

  constructor() {
    super(
      inject(MatDialogRef<ImportModalComponent>),
      inject(NgxSpinnerService)
    );
    this.loading = true;
  }

  ngOnDestroy(): void {
    this.form.reset();
  }

  async onSubmit(): Promise<void> {
    if (this.form.valid) {
      this.loading = true;
      try {
        const fileContent = await this.readFile();
        await this.parseAndValidateFileContentAsync(fileContent);
        this.loading = false;
        this.dialogRef.close({
          importFormat: this.importFormat,
          parsedData: this.parsedData,
          password: this.form.get('password')?.value
        })
      } catch (error) {
        this.loading = false;
        this.displayError('Invalid file content', error);
      }
    } else {
      console.error('Form is invalid:', this.form.errors);
    }
  }

  readFile(): Promise<string> {
    return new Promise((resolve, reject) => {
      const file = this.fileInput.nativeElement.files![0];
      const reader = new FileReader();

      reader.onload = () => {
        resolve(reader.result as string);
      };

      reader.onerror = (error) => {
        reject(error);
      };

      reader.readAsText(file);
    });
  }

  async parseAndValidateFileContentAsync(fileContent: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.parseJsonFileAsync(fileContent);
        if (this.importFormat !== null) {
          resolve()
        } else {
          await this.parseCsvFileAsync(fileContent);
        }
        if (this.importFormat === null) {
          reject(new Error('Unsupported file format'));
        } else {
          resolve();
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  parseJsonFileAsync(fileContent: string): Promise<void> {
    return new Promise((resolve) => {
      try {
        this.parsedData = ImportExportJson.fromString(fileContent);
        this.importFormat = ImportExportFormat.JSON;
        resolve();
      } catch (error) {
        resolve();
      }
    });
  }

  parseCsvFileAsync(fileContent: string): Promise<void> {
    return new Promise(async (resolve) => {
      try {
        const records = await this.parseCsvContentAsync(fileContent);
        const decryptedDataList: DecryptedData[] = records.map(record => {
          return DecryptedData.fromObject(record);
        });
        console.log('Parsed CSV records:', decryptedDataList);
        this.importFormat = ImportExportFormat.CSV;
        this.parsedData = decryptedDataList;
        resolve();
      } catch (error) {
        resolve()
      }
    });
  }

  parseCsvContentAsync(fileContent: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      let records: string[] = [];
      const parser = parse(fileContent,
        {
          delimiter: ',', columns: true
        });
      parser.on('readable', () => {
        let record;
        while ((record = parser.read()) !== null) {
          records.push(record);
        }
        resolve(records);
      });

      parser.on('error', (error) => {
        reject(error);
      });

      parser.on('end', () => {
      });
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.loading = false;
      this.fileName = input.files[0].name;
    } else {
      this.loading = true;
      this.fileName = null;
    }
  }
}
