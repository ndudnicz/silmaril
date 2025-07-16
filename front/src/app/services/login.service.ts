import { Injectable } from '@angular/core';
import { Login } from '../entities/login';
import { environment } from '../../environments/environment';
import { catchError, map, Observable, tap, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { CreateLoginDto } from '../entities/create/create-login-dto';
import { DeleteLoginsDto } from '../entities/delete/delete-login-dto';
import { UpdateLoginDto } from '../entities/update/update-login-dto';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private apiEndpointV1 = environment.apiEndpoint + '/v1';

  constructor(private http: HttpClient) { }

  getLogins$(): Observable<Login[]> {
    return this.http.get<Login[]>(`${this.apiEndpointV1}/login`).pipe(
      map(logins => logins.map(login => Login.fromObject(login)))
    );
  }

  getDeletedLogins$(): Observable<Login[]> {
    return this.http.get<Login[]>(`${this.apiEndpointV1}/login/deleted`).pipe(
      map(logins => logins.map(login => Login.fromObject(login)))
    );
  }

  createLogin$(createLoginDto: CreateLoginDto): Observable<Login> {
    return this.http.post<Login>(`${this.apiEndpointV1}/login`, createLoginDto).pipe(
      map(login => Login.fromObject(login))
    );
  }

  createLogins$(createLoginDtos: CreateLoginDto[]): Observable<Login[]> {
    return this.http.post<Login[]>(`${this.apiEndpointV1}/login/bulk`, createLoginDtos).pipe(
      map(logins => logins.map(login => Login.fromObject(login)))
    );
  }

  updateLogin$(updateLoginDto: UpdateLoginDto): Observable<Login> {
    return this.http.put<Login>(`${this.apiEndpointV1}/login`, updateLoginDto).pipe(
      map(login => Login.fromObject(login))
    );
  }

  updateLogins$(updateLoginDtos: UpdateLoginDto[]): Observable<Login[]> {
    return this.http.put<Login[]>(`${this.apiEndpointV1}/login/bulk`, updateLoginDtos).pipe(
      map(logins => logins.map(login => Login.fromObject(login)))
    );
  }

  deleteLogin$(id: string): Observable<number> {
    return this.http.delete<number>(`${this.apiEndpointV1}/login/${id}`);
  }

  deleteLogins$(deleteLoginsDto: DeleteLoginsDto): Observable<number> {
    return this.http.delete<number>(`${this.apiEndpointV1}/login/bulk`, {
      body: deleteLoginsDto
    });
  }
}
