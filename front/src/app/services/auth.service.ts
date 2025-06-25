import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { jwtDecode } from "jwt-decode";
import { AuthResponse } from '../entities/authentication/authResponse';
import { VaultService } from './vault.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiEndpointV1 = environment.apiEndpoint + '/v1';
  private JWT_TOKEN_KEY = 'jwtToken';
  private AUTHENTICATED_KEY = 'authenticated';
  private JWT_EXPIRES = 'jwtExpires';
  private USER_ID = 'userId';
  private timeoutRefreshToken: any = null;

  constructor(
    private vaultService: VaultService
  ) { }

  private setLocalStorage(authResponse: AuthResponse): void {
    const parsedToken = jwtDecode(authResponse.jwtToken);
    localStorage.setItem(this.JWT_TOKEN_KEY, authResponse.jwtToken);
    localStorage.setItem(this.AUTHENTICATED_KEY, String(true));
    localStorage.setItem(this.JWT_EXPIRES, String(parsedToken.exp));
    localStorage.setItem(this.USER_ID, String((parsedToken as any).unique_name));
  }

  public clearLocalStorage(): void {
    console.log('Clearing local storage');
    localStorage.removeItem(this.JWT_TOKEN_KEY);
    localStorage.removeItem(this.AUTHENTICATED_KEY);
    localStorage.removeItem(this.JWT_EXPIRES);
    localStorage.removeItem(this.USER_ID);

    if (this.timeoutRefreshToken) {
      clearTimeout(this.timeoutRefreshToken);
      this.timeoutRefreshToken = null;
    }
  }

  private setRefreshTokenTimeout(): void {
    var jwtExpires = Number(localStorage.getItem(this.JWT_EXPIRES))
    console.log(`JWT Expires at: ${jwtExpires}, next refresh in: ${jwtExpires - Math.floor(Date.now() / 1000)} seconds`);
    if (jwtExpires) {
      const now = Math.floor(Date.now() / 1000);
      const refreshTime = jwtExpires - now - 60; // Refresh 1 minute before expiration
      this.timeoutRefreshToken = setTimeout(() => {
        this.refreshTokenAsync().catch(error => console.error('Error refreshing token:', error));
      }, refreshTime * 1000);
    }
  }

  public async authAsync(username: string, password: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiEndpointV1}/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      const data = await response.json() as AuthResponse;
      this.setLocalStorage(data);
      this.setRefreshTokenTimeout();
      return response.ok;
    } catch (error) {
      console.error('Error during authentication:', error);
      throw error;
    }
  }

  public async refreshTokenAsync(): Promise<boolean> {
    try {
      console.log('Refreshing token...');
      const response = await fetch(`${this.apiEndpointV1}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Token refresh failed');
      }
      const data = await response.json() as AuthResponse;
      this.setLocalStorage(data);
      console.log('Token refreshed successfully');
      this.setRefreshTokenTimeout();
      return response.ok;
    } catch (error) {
      console.error('Error during authentication:', error);
      throw error;
    }
  }

  public async signoutAsync(): Promise<void> {
    try {
      const response = await fetch(`${this.apiEndpointV1}/auth/signout`, {
        method: 'POST',
        headers: this.addAuthHeader({
          'Content-Type': 'application/json'
        }),
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Signout failed');
      }
      this.vaultService.clearKey();
      this.vaultService.clearSalt();
      this.clearLocalStorage();
    } catch (error) {
      console.error('Error during signout:', error);
      throw error;
    }
  }

  public getJwtToken(): string | null {
    return localStorage.getItem(this.JWT_TOKEN_KEY);
  }

  public getUserId(): string | null {
    return localStorage.getItem(this.USER_ID);
  }

  public isTokenValid(): boolean {
    if (!this.getJwtToken()) {
      return false;
    }
    return Number(localStorage.getItem('jwtExpires')) > Math.floor(Date.now() / 1000);
  }

  public addAuthHeader(headers: HeadersInit): Headers {
    if (!this.getJwtToken() || !this.isTokenValid()) {
      return new Headers(headers || {});
    }
    const h = new Headers(headers || {});
    h.append('Authorization', `Bearer ${this.getJwtToken()}`);
    return h;
  }

  public isAuthenticated(): boolean {
    return Boolean(localStorage.getItem(this.AUTHENTICATED_KEY)) && this.isTokenValid();
  }
}
