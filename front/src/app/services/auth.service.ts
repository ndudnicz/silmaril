import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { jwtDecode } from "jwt-decode";
import { AuthResponse } from '../entities/authentication/authResponse';
import { FetchService } from './fetch.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiEndpointV1 = environment.apiEndpoint + '/v1';
  private static JWT_TOKEN_KEY = 'jwtToken';
  private static AUTHENTICATED_KEY = 'authenticated';
  private static JWT_EXPIRES = 'jwtExpires';
  private static USER_ID = 'userId';

  constructor(private fetchService: FetchService) { }

  private setLocalStorage(authResponse: AuthResponse): void {
    const parsedToken = jwtDecode(authResponse.jwtToken);
    localStorage.setItem(AuthService.JWT_TOKEN_KEY, authResponse.jwtToken);
    localStorage.setItem(AuthService.AUTHENTICATED_KEY, String(true));
    localStorage.setItem(AuthService.JWT_EXPIRES, String(parsedToken.exp));
    localStorage.setItem(AuthService.USER_ID, String((parsedToken as any).unique_name));
  }

  public clearLocalStorage(): void {
    localStorage.removeItem(AuthService.JWT_TOKEN_KEY);
    localStorage.removeItem(AuthService.AUTHENTICATED_KEY);
    localStorage.removeItem(AuthService.JWT_EXPIRES);
    localStorage.removeItem(AuthService.USER_ID);
  }

  public async authAsync(username: string, password: string): Promise<boolean> {
    try {
      const response = await this.fetchService.postAsync(
        `${this.apiEndpointV1}/auth`,
        { 
          body: JSON.stringify({ username, password }),
          credentials: 'include'
        });
      
      if (!response.ok) {
        throw new Error(await response.text());
      }
      const data = await response.json() as AuthResponse;
      this.setLocalStorage(data);
      return response.ok;
    } catch (error) {
      console.error('Error during authentication:', error);
      throw error;
    }
  }

  public async refreshTokenAsync(): Promise<boolean> {
    try {
      const response = await this.fetchService.postAsync(
        `${this.apiEndpointV1}/auth/refresh-token`, {credentials: 'include'});
      if (!response.ok) {
        throw new Error('Token refresh failed');
      }
      const data = await response.json() as AuthResponse;
      this.setLocalStorage(data);
      return response.ok;
    } catch (error) {
      console.error('Error during authentication:', error);
      throw error;
    }
  }

  public async signoutAsync(): Promise<void> {
    try {
      const response = await this.fetchService.postAsync(
        `${this.apiEndpointV1}/auth/signout`, { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Signout failed');
      }
      this.clearLocalStorage();
    } catch (error) {
      console.error('Error during signout:', error);
      throw error;
    }
  }

  public static getJwtToken(): string | null {
    return localStorage.getItem(this.JWT_TOKEN_KEY);
  }

  public static getUserId(): string | null {
    return localStorage.getItem(this.USER_ID);
  }

  public static isTokenValid(): boolean {
    if (!this.getJwtToken()) {
      return false;
    }
    return Number(localStorage.getItem('jwtExpires')) > Math.floor(Date.now() / 1000);
  }

  public static addAuthHeader(headers: HeadersInit): Headers {
    if (!this.getJwtToken() || !this.isTokenValid()) {
      return new Headers(headers || {});
    }
    const h = new Headers(headers || {});
    h.append('Authorization', `Bearer ${this.getJwtToken()}`);
    return h;
  }

  public static isAuthenticated(): boolean {
    return Boolean(localStorage.getItem(AuthService.AUTHENTICATED_KEY)) && AuthService.isTokenValid();
  }
}
