import { inject, Injectable } from '@angular/core';
import { base64ToUint8Array, CryptoUtilsV1 } from '../utils/crypto.utils';
import { Credential } from '../entities/credential';
import { Vault } from '../entities/vault';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { catchError, from, map, Observable, switchMap, take, tap, throwError, toArray } from 'rxjs';
import { CreateVaultDto } from '../entities/create/create-vault-dto';
import { DecryptedData } from '../entities/decrypted-data';
import { UpdateVaultDto } from '../entities/update/update-vault-dto';

@Injectable({ providedIn: 'root' })
export class VaultService {
  private readonly SALT_KEY_NAME = 'vault-salt';
  private key: CryptoKey | null = null;
  private apiEndpointV1 = environment.apiEndpoint + '/v1';
  private readonly http = inject(HttpClient);

  public setSalt(salt: string): void {
    console.log(`Setting salt: ${salt}`, typeof salt);

    if (!salt) {
      const errorMessage = 'Salt not found. Please contact support.';
      throw new Error(errorMessage);
    }

    localStorage.setItem(this.SALT_KEY_NAME, salt);
  }

  public clearSalt(): void {
    console.log('Clearing salt');
    localStorage.removeItem(this.SALT_KEY_NAME);
  }

  public setKey$(masterPassword: string): Observable<ArrayBuffer> {
    const storedSaltBase64 = localStorage.getItem(this.SALT_KEY_NAME);
    if (!storedSaltBase64) {
      const errorMessage = 'Salt not set. Please set the salt before setting the master password.';
      throw new Error(errorMessage);
    }
    const saltUint8Array = base64ToUint8Array(storedSaltBase64);
    return CryptoUtilsV1.deriveKeyFromPassword$(masterPassword, saltUint8Array).pipe(
      take(1),
      map((derivedKey) => {
        this.key = derivedKey;
        return derivedKey;
      }),
      switchMap((derivedKey) => CryptoUtilsV1.exportKey$(derivedKey)),
      catchError((error) => {
        console.error('Failed to set the key:', error);
        return throwError(
          () =>
            new Error(
              'Failed to set the key:' + (error instanceof Error ? error.message : 'Unknown error'),
              { cause: error },
            ),
        );
      }),
    );
  }

  public isUnlocked(): boolean {
    return this.key !== null;
  }

  public getKey(): CryptoKey | null {
    return this.key;
  }

  public clearKey(): void {
    this.key = null;
  }

  encryptCredentialData$(credential: Credential): Observable<Credential> {
    if (!this.key) {
      return throwError(
        () => new Error('Vault is locked. Please set the master password.'),
      );
    }
    console.log('Encrypting credential data:', credential);
    return CryptoUtilsV1.encryptData$(this.key, credential.decryptedData!.toString()).pipe(
      take(1),
      map((encryptionResult) => {
        console.log(
          'Encrypted data:',
          credential.initializationVector,
          encryptionResult.initializationVector,
        );
        credential.encryptedData = encryptionResult.ciphertext;
        credential.initializationVector = encryptionResult.initializationVector;
        credential.encryptionVersion = encryptionResult.encryptionVersion;
        console.log(
          'Encrypted data:',
          credential.initializationVector,
          encryptionResult.initializationVector,
        );
        return credential;
      }),
      catchError((error) => {
        console.error('Error encrypting credential data:', error);
        return throwError(
          () =>
            new Error(
              'Error encrypting credential data:' +
                (error instanceof Error ? error.message : 'Unknown error during encryption'),
            ),
        );
      }),
    );
  }

  encryptAllCredentials$(credentials: Credential[]): Observable<Credential[]> {
    if (!this.key) {
      return throwError(
        () => new Error('Vault is locked. Please set the master password.'),
      );
    }
    return from(credentials).pipe(
      switchMap((credential) => this.encryptCredentialData$(credential)),
      toArray(),
      catchError((error) => {
        console.error('Error encrypting credentials:', error);
        return throwError(
          () =>
            new Error(
              'Error encrypting credentials:' +
                (error instanceof Error ? error.message : 'Unknown error during encryption'),
            ),
        );
      }),
    );
  }

  decryptCredentialData$(credential: Credential): Observable<Credential> {
    if (!this.key) {
      return throwError(
        () => new Error('Vault is locked. Please set the master password.'),
      );
    }
    return CryptoUtilsV1.decryptData$(this.key, credential.encryptedData!, credential.initializationVector!).pipe(
      take(1),
      map((decryptedDataString) => {
        credential.decryptedData = DecryptedData.fromString(decryptedDataString);
        console.log('Credential data decrypted successfully:', credential.decryptedData.toString());
        return credential;
      }),
      catchError((error) => {
        console.error('Error decrypting credential data:', error);
        return throwError(
          () =>
            new Error(
              'Error decrypting credential data:' +
                (error instanceof Error ? error.message : 'Unknown error during decryption'),
            ),
        );
      }),
    );
  }

  decryptAllCredentials$(credentials: Credential[]): Observable<Credential[]> {
    if (!this.key) {
      return throwError(
        () => new Error('Vault is locked. Please set the master password.'),
      );
    }
    return from(credentials).pipe(
      switchMap((credential) => this.decryptCredentialData$(credential)),
      toArray(),
            tap((credentials) => console.log('All credentials decrypted successfully', credentials)),
      catchError((error) => {
        console.error('Error decrypting credentials:', error);
        return throwError(
          () =>
            new Error(
              'Error decrypting credentials:' +
                (error instanceof Error ? error.message : 'Unknown error during decryption'),
            ),
        );
      }),
    );
  }

  public getVaults$(): Observable<Vault[]> {
    const url = `${this.apiEndpointV1}/vault`;
    return this.http.get<Vault[]>(url);
  }

  public createVault$(createVaultDto: CreateVaultDto): Observable<Vault> {
    const url = `${this.apiEndpointV1}/vault`;
    return this.http.post<Vault>(url, createVaultDto);
  }

  public updateVault$(UpdateVaultDto: UpdateVaultDto): Observable<Vault> {
    const url = `${this.apiEndpointV1}/vault`;
    return this.http.put<Vault>(url, UpdateVaultDto);
  }

  public deleteVault$(vaultId: string): Observable<number> {
    const url = `${this.apiEndpointV1}/vault/${vaultId}`;
    return this.http.delete<number>(url);
  }
}
