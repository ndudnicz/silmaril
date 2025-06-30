import { NgxSpinnerService } from "ngx-spinner";

// base-form.component.ts
export class BaseComponent {
  protected loading = false;

  protected constructor(private spinner: NgxSpinnerService) { }

  protected startLoading(): void {
    this.loading = true;
    this.spinner.show();
  }

  protected stopLoading(): void {
    this.loading = false;
    this.spinner.hide();
  }
}