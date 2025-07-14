import { MatDialogRef } from '@angular/material/dialog';
import { BaseComponent } from '../../base-component.component';
import { NgxSpinnerService } from 'ngx-spinner';

export class BaseModalComponent extends BaseComponent {
  constructor(
    protected dialogRef: MatDialogRef<BaseModalComponent>,
    protected spinnerService: NgxSpinnerService
  ) {
    super(spinnerService);
  }

  protected closeDialog(result: any | null = null): void {
    this.dialogRef.close(result);
  }
}
