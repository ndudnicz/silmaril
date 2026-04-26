import { inject } from '@angular/core';
import { BaseComponent } from '../../base-component.component';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

export class BaseModalComponent extends BaseComponent {
  protected ref = inject(DynamicDialogRef);

  protected closeDialog(result: unknown | null = null): void {
    this.ref.close(result);
  }
}
