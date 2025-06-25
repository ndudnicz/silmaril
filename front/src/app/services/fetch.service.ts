import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { VaultService } from './vault.service';

@Injectable({
  providedIn: 'root',
})
export class FetchService {

  constructor(
    private router: Router,
    private authService: AuthService,
    private vaultService: VaultService // Assuming VaultService is similar to AuthService
  ) { }

  public async getAsync(url: string, requestInit: RequestInit): Promise<Response> {
    try {
      requestInit.headers = this.authService.addAuthHeader(requestInit.headers ?? {});
      requestInit.method = 'GET';
      const response = await fetch(url, requestInit);
      this.redirectIfNotAuthenticated(response);
      return response;
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  }

  public async postAsync(url: string, requestInit: RequestInit): Promise<Response> {
    try {
      if (!(requestInit.headers instanceof Headers)) {
        requestInit.headers = new Headers(requestInit.headers);
      }
      requestInit.headers = this.authService.addAuthHeader(requestInit.headers ?? {});
      requestInit.method = 'POST';
      if (!requestInit.headers.has('Content-Type')) {
        requestInit.headers.append('Content-Type', 'application/json');
      }
      const response = await fetch(url, requestInit);
      this.redirectIfNotAuthenticated(response);
      return response;
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  }

  public async putAsync(url: string, requestInit: RequestInit): Promise<Response> {
    try {
      requestInit.headers = this.authService.addAuthHeader(requestInit.headers ?? {});
      requestInit.method = 'PUT';
      if (!requestInit.headers.has('Content-Type')) {
        requestInit.headers.append('Content-Type', 'application/json');
      }
      const response = await fetch(url, requestInit);
      this.redirectIfNotAuthenticated(response);
      return response;
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  }

  public async deleteAsync(url: string, requestInit: RequestInit): Promise<Response> {
    try {
      requestInit.headers = this.authService.addAuthHeader(requestInit.headers ?? {});
      requestInit.method = 'DELETE';
      const response = await fetch(url, requestInit);
      this.redirectIfNotAuthenticated(response);
      return response;
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  }

  private async redirectIfNotAuthenticated(response: Response): Promise<void> {
    if (response.status === 401) {
      console.log('Unauthorized access - redirecting to sign-in');
      this.vaultService.clearKey();
      this.vaultService.clearSalt();
      this.authService.clearLocalStorage();
      this.router.navigate(['/signin']);
      throw new Error('Unauthorized access - redirecting to sign-in');
    }
  }
}
