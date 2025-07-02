import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';

import { importProvidersFrom } from '@angular/core';
import { NgxSpinnerModule } from "ngx-spinner";
import { BrowserAnimationsModule, provideAnimations } from '@angular/platform-browser/animations';
import { authInterceptorFn } from './app/http-interceptor/auth-interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withInterceptors([authInterceptorFn])),
    provideRouter(routes),
    importProvidersFrom(BrowserAnimationsModule, NgxSpinnerModule),
    provideAnimations(),
  ]
});