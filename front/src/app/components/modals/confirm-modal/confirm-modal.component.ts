import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

export interface ConfirmModalData {
  message: string;
  confirmText: string;
  cancelText: string;
}

@Component({
  selector: 'app-confirm-modal',
  imports: [ButtonModule],
  templateUrl: './confirm-modal.component.html',
})
export class ConfirmModalComponent {
  private readonly dialogRef = inject(DynamicDialogRef);
  private readonly config = inject(DynamicDialogConfig);
  protected readonly data = this.config.data as ConfirmModalData;

  onConfirm() {
    this.dialogRef.close(true);
  }

  onCancel() {
    this.dialogRef.close(false);
  }
}
