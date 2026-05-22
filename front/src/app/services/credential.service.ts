import { inject, Injectable } from '@angular/core';
import { Credential } from '../entities/credential';
import { environment } from '../../environments/environment';
import { map, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { CreateCredentialDto } from '../entities/create/create-credential-dto';
import { DeleteCredentialsDto } from '../entities/delete/delete-credential-dto';
import { UpdateCredentialDto } from '../entities/update/update-credential-dto';

@Injectable({
  providedIn: 'root',
})
export class CredentialService {
  private apiEndpointV1 = environment.apiEndpoint + '/v1';
  private readonly http = inject(HttpClient);

  getCredentials$(): Observable<Credential[]> {
    return this.http
      .get<Credential[]>(`${this.apiEndpointV1}/credential`)
      .pipe(
        map((credentials) => credentials.map((credential) => Credential.fromObject(credential))),
      );
  }

  getDeletedCredentials$(): Observable<Credential[]> {
    return this.http
      .get<Credential[]>(`${this.apiEndpointV1}/credential/deleted`)
      .pipe(
        map((credentials) => credentials.map((credential) => Credential.fromObject(credential))),
      );
  }

  createCredential$(createCredentialDto: CreateCredentialDto): Observable<Credential> {
    return this.http
      .post<Credential>(`${this.apiEndpointV1}/credential`, createCredentialDto)
      .pipe(map((credential) => Credential.fromObject(credential)));
  }

  createCredentials$(createCredentialDtos: CreateCredentialDto[]): Observable<Credential[]> {
    return this.http
      .post<Credential[]>(`${this.apiEndpointV1}/credential/bulk`, createCredentialDtos)
      .pipe(
        map((credentials) => credentials.map((credential) => Credential.fromObject(credential))),
      );
  }

  updateCredential$(updateCredentialDto: UpdateCredentialDto): Observable<Credential> {
    return this.http
      .put<Credential>(`${this.apiEndpointV1}/credential`, updateCredentialDto)
      .pipe(map((credential) => Credential.fromObject(credential)));
  }

  updateCredentials$(updateCredentialDtos: UpdateCredentialDto[]): Observable<Credential[]> {
    return this.http
      .put<Credential[]>(`${this.apiEndpointV1}/credential/bulk`, updateCredentialDtos)
      .pipe(
        map((credentials) => credentials.map((credential) => Credential.fromObject(credential))),
      );
  }

  deleteCredential$(id: string): Observable<number> {
    return this.http.delete<number>(`${this.apiEndpointV1}/credential/${id}`);
  }

  deleteCredentials$(deleteCredentialsDto: DeleteCredentialsDto): Observable<number> {
    return this.http.delete<number>(`${this.apiEndpointV1}/credential/bulk`, {
      body: deleteCredentialsDto,
    });
  }
}
