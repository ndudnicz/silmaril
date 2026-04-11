import { Injectable } from '@angular/core';
import { Credential } from '../entities/credential';
import { environment } from '../../environments/environment';
import { catchError, map, Observable, tap, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { CreateCredentialDto } from '../entities/create/create-credential-dto';
import { DeleteCredentialsDto } from '../entities/delete/delete-credential-dto';
import { UpdateCredentialDto } from '../entities/update/update-credential-dto';

@Injectable({
  providedIn: 'root'
})
export class CredentialService {
  private apiEndpointV1 = environment.apiEndpoint + '/v1';

  constructor(private http: HttpClient) { }

  getCredentials$(): Observable<Credential[]> {
    return this.http.get<Credential[]>(`${this.apiEndpointV1}/login`).pipe(
      map(logins => logins.map(login => Credential.fromObject(login)))
    );
  }

  getDeletedCredentials$(): Observable<Credential[]> {
    return this.http.get<Credential[]>(`${this.apiEndpointV1}/login/deleted`).pipe(
      map(logins => logins.map(login => Credential.fromObject(login)))
    );
  }

  createCredential$(createLoginDto: CreateCredentialDto): Observable<Credential> {
    return this.http.post<Credential>(`${this.apiEndpointV1}/login`, createLoginDto).pipe(
      map(login => Credential.fromObject(login))
    );
  }

  createCredentials$(createLoginDtos: CreateCredentialDto[]): Observable<Credential[]> {
    return this.http.post<Credential[]>(`${this.apiEndpointV1}/login/bulk`, createLoginDtos).pipe(
      map(logins => logins.map(login => Credential.fromObject(login)))
    );
  }

  updateCredential$(updateLoginDto: UpdateCredentialDto): Observable<Credential> {
    return this.http.put<Credential>(`${this.apiEndpointV1}/login`, updateLoginDto).pipe(
      map(login => Credential.fromObject(login))
    );
  }

  updateCredentials$(updateLoginDtos: UpdateCredentialDto[]): Observable<Credential[]> {
    return this.http.put<Credential[]>(`${this.apiEndpointV1}/login/bulk`, updateLoginDtos).pipe(
      map(logins => logins.map(login => Credential.fromObject(login)))
    );
  }

  deleteCredential$(id: string): Observable<number> {
    return this.http.delete<number>(`${this.apiEndpointV1}/login/${id}`);
  }

  deleteCredentials$(deleteLoginsDto: DeleteCredentialsDto): Observable<number> {
    return this.http.delete<number>(`${this.apiEndpointV1}/login/bulk`, {
      body: deleteLoginsDto
    });
  }
}
