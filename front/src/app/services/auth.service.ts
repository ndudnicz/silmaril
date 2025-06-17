import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { jwtDecode } from "jwt-decode";
import { AuthResponse } from '../entities/authentication/authResponse';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

  private static apiEndpointV1 = environment.apiEndpoint + '/v1';
  private static JWT_TOKEN_KEY = 'jwtToken';
  private static REFRESH_TOKEN_KEY = 'refreshToken';
  private static AUTHENTICATED_KEY = 'authenticated';
  private static JWT_EXPIRES = 'jwtExpires';

  private static setLocalStorage(authResponse: AuthResponse): void {
    const parsedToken = jwtDecode(authResponse.jwtToken);
    localStorage.setItem(this.JWT_TOKEN_KEY, authResponse.jwtToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, authResponse.refreshToken);
    localStorage.setItem(this.AUTHENTICATED_KEY, String(true));
    localStorage.setItem(this.JWT_EXPIRES, String(parsedToken.exp));
  }

  public static async authAsync(username: string, password: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiEndpointV1}/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
      console.log('authAsync', response, response.ok, response.status);
      
      if (!response.ok) {
        throw new Error('Authentication failed');
      }
      const data = await response.json() as AuthResponse;
      this.setLocalStorage(data);
      return response.ok;
    } catch (error) {
      console.error('Error during authentication:', error);
      return false;
    }
  }

  public static async refreshTokenAsync(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiEndpointV1}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: localStorage.getItem('refreshToken') })
      });
      if (!response.ok) {
        throw new Error('Token refresh failed');
      }
      const data = await response.json() as AuthResponse;
      this.setLocalStorage(data);
      return response.ok;
    } catch (error) {
      console.error('Error during token refresh:', error);
      return false;
    }
  }

  public static getJwtToken(): string | null {
    return localStorage.getItem(this.JWT_TOKEN_KEY);
  }

  public static isTokenValid(): boolean {
    if (!this.getJwtToken()) {
      return false;
    }
    return Number(localStorage.getItem('jwtExpires')) > Math.floor(Date.now() / 1000);
  }

  public static addAuthHeader(headers: HeadersInit): Headers {
    if (!this.getJwtToken() || !this.isTokenValid()) {
      throw new Error('Invalid or missing JWT token');
    }
    const h = new Headers(headers || {});
    h.append('Authorization', `Bearer ${this.getJwtToken()}`);
    return h;
  }

  public static isAuthenticated(): boolean {
    return Boolean(localStorage.getItem(this.AUTHENTICATED_KEY)) && this.isTokenValid();
  }
}
