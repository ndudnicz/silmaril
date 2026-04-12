import { inject } from '@angular/core';
import { BaseComponent } from '../../base-component.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

export class BaseModalComponent extends BaseComponent {
  protected ref = inject(DynamicDialogRef);

  protected closeDialog(result: any | null = null): void {
    this.ref.close(result);
  }
}
