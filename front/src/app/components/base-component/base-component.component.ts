import { NgxSpinnerService } from "ngx-spinner";
import { Subject, Subscription } from "rxjs";

export class BaseComponent {
  protected loading = false;
  protected destroy$ = new Subject<void>();

  protected constructor(private spinner: NgxSpinnerService) { }

  protected startLoading(): void {
    this.loading = true;
    this.spinner.show();
  }

  protected stopLoading(): void {
    this.loading = false;
    this.spinner.hide();
  }

  protected openInNewTab(path: string): void {
    const baseUrl = window.location.origin;
    window.open(`${baseUrl}${path}`, '_blank');
  }
}