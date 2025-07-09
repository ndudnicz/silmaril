import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { BaseModalComponent } from '../../../base-component/modal/base-modal/base-modal.component';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-restore-logins-modal',
  imports: [
    MatIconModule,
    CommonModule,
    MatFormFieldModule,
    MatDialogModule
  ],
  templateUrl: './restore-logins-modal.component.html',
  styleUrl: './restore-logins-modal.component.css'
})
export class RestoreLoginsModalComponent extends BaseModalComponent {

  constructor() {
    super(inject(MatDialogRef<RestoreLoginsModalComponent>), inject(NgxSpinnerService));
  }
}
