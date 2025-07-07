import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { jwtDecode } from "jwt-decode";
import { AuthResponse } from '../entities/authentication/authResponse';
import { VaultService } from './vault.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, Subscription, take, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiEndpointV1 = environment.apiEndpoint + '/v1';
  private readonly JWT_TOKEN_KEY = 'jwtToken';
  private readonly AUTHENTICATED_KEY = 'authenticated';
  private readonly JWT_EXPIRES = 'jwtExpires';
  private readonly USER_ID = 'userId';
  private readonly CSRF_TOKEN_KEY = 'csrfToken';
  private readonly CSRF_COOKIE_NAME = 'XSRF-TOKEN';
  private readonly CSRF_HEADER_NAME = 'X-CSRF-TOKEN';
  private timeoutRefreshToken: any = null;
  private refreshTokenDelayInSeconds = 60;

  constructor(
    private vaultService: VaultService,
    private http: HttpClient
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
    localStorage.removeItem(this.CSRF_TOKEN_KEY);

    if (this.timeoutRefreshToken) {
      clearTimeout(this.timeoutRefreshToken);
      this.timeoutRefreshToken = null;
    }
  }

  public setRefreshTokenTimeout(): void {
    if (this.timeoutRefreshToken) {
      clearTimeout(this.timeoutRefreshToken);
      this.timeoutRefreshToken = null;
    }
    var jwtExpires = Number(localStorage.getItem(this.JWT_EXPIRES))
    if (jwtExpires) {
      const now = Math.floor(Date.now() / 1000);
      const refreshTime = jwtExpires - now - this.refreshTokenDelayInSeconds; // Refresh 1 minute before expiration
      console.log(`JWT Expires at: ${jwtExpires}, next refresh in: ${refreshTime} seconds`);
      this.timeoutRefreshToken = setTimeout(() => {
        this.refreshToken$()
          .pipe(take(1))
          .subscribe({
            next: () => console.log('Token refreshed successfully'),
            error: (error) => console.error('Error refreshing token:', error)
        });
      }, refreshTime * 1000);
    }
  }

  public auth$(username: string, password: string): Observable<boolean> {
    const url = `${this.apiEndpointV1}/auth`;
    const body = { username, password };

    return this.http.post<AuthResponse>(url, body, {
      withCredentials: true,
      headers: this.addCsrfHeader()
    }).pipe(
      tap(response => {
        this.setLocalStorage(response);
        this.setRefreshTokenTimeout();
        this.setCsrfToken(this.getCookie(this.CSRF_COOKIE_NAME) ?? '');
      }),
      map(() => true),
      catchError(error => {
        let message = error.error || 'Authentication failed';
        console.error('Error during authentication:', message);
        return throwError(() => new Error(message));
      })
    );
  }

  public getCsrfCookie(): void {
    const url = `${this.apiEndpointV1}/auth/csrf-cookie`;

    this.http.get(url, {
      withCredentials: true 
    }).pipe(
      take(1),
      tap(() => {
        const csrfToken = this.getCookie(this.CSRF_COOKIE_NAME);
        if (csrfToken) {
          this.setCsrfToken(csrfToken);
          console.log('CSRF token set successfully');
        } else {
          console.warn('CSRF token not found in cookies');
        }
      }),
      catchError(error => {
        let message = error.error || 'Error fetching CSRF cookie';
        console.error('Error fetching CSRF cookie:', message);
        return throwError(() => new Error(message));
      })
    ).subscribe({
      next: () => console.log('CSRF cookie fetched successfully'),
      error: (error) => console.error('Error in CSRF cookie subscription:', error)
    });
  }

  public refreshToken$(): Observable<boolean> {
    const url = `${this.apiEndpointV1}/auth/refresh-token`;

    return this.http.post<AuthResponse>(url, {}, {
      headers: this.addCsrfHeader(),
      withCredentials: true
    }).pipe(
      tap(response => {
        this.setLocalStorage(response);
        console.log('Token refreshed successfully');
        this.setRefreshTokenTimeout();
      }),
      map(() => true),
      catchError(error => {
        let message = error.error || 'Token refresh failed';
        console.error('Error during token refresh:', message);
        return throwError(() => new Error(message));
      })
    );
  }

  public signout$(): Observable<boolean> {
    const url = `${this.apiEndpointV1}/auth/signout`;

    return this.http.post<string>(url, {}, {
      withCredentials: true,
      responseType: 'text' as 'json'
    }).pipe(
      tap(() => {
        this.vaultService.clearKey();
        this.vaultService.clearSalt();
        this.clearLocalStorage();
      }),
      map(() => true),
      catchError(error => {
        let message = error.error || 'Signout failed';
        console.error('Error during signout:', message);
        return throwError(() => new Error(message));
      })
    );
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

  public addCsrfHeader(headers: HttpHeaders = new HttpHeaders({})): HttpHeaders {
    return headers.append(this.CSRF_HEADER_NAME, this.getCsrfToken() ?? '');
  }

  public isAuthenticated(): boolean {
    return Boolean(localStorage.getItem(this.AUTHENTICATED_KEY)) && this.isTokenValid();
  }

  public getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }

  public setCsrfToken(token: string): void {
    localStorage.setItem(this.CSRF_TOKEN_KEY, token);
  }

  public getCsrfToken(): string | null {
    return localStorage.getItem(this.CSRF_TOKEN_KEY);
  }

  public clearCsrfToken(): void {
    localStorage.removeItem(this.CSRF_TOKEN_KEY);
  }
}
