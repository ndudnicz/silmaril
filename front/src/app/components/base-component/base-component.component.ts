import { NgxSpinnerService } from "ngx-spinner";
import { ToastWrapper } from "../../utils/toast.wrapper";

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

  protected openInNewTab(path: string): void {
    const baseUrl = window.location.origin;
    window.open(`${baseUrl}${path}`, '_blank');
  }

  protected displayError(title: string, error: any): void {
    console.error(title, error);
    const errorMessage = error?.error?.message ?? 'An unknown error occurred';
    ToastWrapper.error(title, errorMessage);
  }
}