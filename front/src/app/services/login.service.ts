import { Injectable } from '@angular/core';
import { CreateLoginDto, Login, UpdateLoginDto } from '../entities/login';
import { environment } from '../../environments/environment';
import { catchError, map, Observable, tap, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private apiEndpointV1 = environment.apiEndpoint + '/v1';

  constructor(private http: HttpClient) { }

  getLogins$(): Observable<Login[]> {
    return this.http.get<Login[]>(`${this.apiEndpointV1}/login`).pipe(
      map((logins: Login[]) =>
        logins.map(login => Login.fromObject(login))
      ),
      catchError(error => {
        console.error('Error fetching logins:', error);
        return throwError(() => new Error('Failed to fetch logins'));
      })
    );
  }

  createLogin$(createLoginDto: CreateLoginDto): Observable<Login> {
    return this.http.post<Login>(`${this.apiEndpointV1}/login`, createLoginDto).pipe(
      map(login => Login.fromObject(login)),
      catchError(error => {
        console.error('Error creating login:', error);
        return throwError(() => new Error('Failed to create login'));
      })
    );
  }

  createLoginsBulk$(createLoginDtos: CreateLoginDto[]): Observable<Login[]> {
    return this.http.post<Login[]>(`${this.apiEndpointV1}/login/bulk`, createLoginDtos).pipe(
      map(logins => logins.map(login => Login.fromObject(login))),
      catchError(error => {
        console.error('Error creating logins bulk:', error);
        return throwError(() => new Error('Failed to create logins bulk'));
      })
    );
  }

  updateLogin$(updateLoginDto: UpdateLoginDto): Observable<Login> {
    return this.http.put<Login>(`${this.apiEndpointV1}/login`, updateLoginDto).pipe(
      tap(() => console.log('Updating login with data:', updateLoginDto)),
      map(login => Login.fromObject(login)),
      catchError(error => {
        console.error('Error updating login:', error);
        return throwError(() => new Error('Failed to update login'));
      })
    );
  }

  updateLoginsBulk$(updateLoginDtos: UpdateLoginDto[]): Observable<Login[]> {
    return this.http.put<Login[]>(`${this.apiEndpointV1}/login/bulk`, updateLoginDtos).pipe(
      map(logins => logins.map(login => Login.fromObject(login))),
      catchError(error => {
        console.error('Error updating logins:', error);
        return throwError(() => new Error('Failed to update logins bulk'));
      })
    );
  }

  deleteLogin$(id: string): Observable<number> {
    return this.http.delete<number>(`${this.apiEndpointV1}/login/${id}`).pipe(
      catchError(error => {
        console.error('Error deleting login:', error);
        return throwError(() => new Error('Failed to delete login'));
      })
    );
  }
}
