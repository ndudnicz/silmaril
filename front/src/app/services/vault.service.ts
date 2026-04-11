import { Injectable } from '@angular/core';
import { base64ToUint8Array, CryptoUtilsV1 } from '../utils/crypto.utils';
import { Credential } from '../entities/credential';
import { Vault } from '../entities/vault';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { CreateVaultDto } from '../entities/create/create-vault-dto';
import { DecryptedData } from '../entities/decrypted-data';
import { UpdateVaultDto } from '../entities/update/update-vault-dto';

@Injectable({ providedIn: 'root' })
export class VaultService {
  private SALT_KEY_NAME = 'vault-salt';
  private key: CryptoKey | null = null;
  private apiEndpointV1 = environment.apiEndpoint + '/v1';

  constructor(private http: HttpClient) {
    this.key = null;
  }

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

  public async setKeyAsync(masterPassword: string): Promise<void> {
    const storedSaltBase64 = localStorage.getItem(this.SALT_KEY_NAME);
    console.log(`Stored salt base64: ${storedSaltBase64}`, typeof storedSaltBase64);

    if (!storedSaltBase64) {
      const errorMessage = 'Salt not set. Please set the salt before setting the master password.';
      throw new Error(errorMessage);
    }
    try {
      console.log(`Setting key with salt b64: ${storedSaltBase64}`);
      const saltUint8Array = base64ToUint8Array(storedSaltBase64);
      console.log(`Salt Uint8Array: ${saltUint8Array}`);
      this.key = await CryptoUtilsV1.deriveKeyFromPasswordAsync(masterPassword, saltUint8Array);
      const exportedKey = await CryptoUtilsV1.exportKeyAsync(this.key);
      console.log(`Key set successfully. Exported key: ${exportedKey}`);
    }
    catch (error) {
      console.log(error);
      throw new Error('Failed to set the key:' + (error instanceof Error ? error.message : 'Unknown error'));
    }
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

  async encryptCredentialDataAsync(credential: Credential): Promise<Credential> {
    return new Promise<Credential>(async (resolve, reject) => {
      try {
        if (!this.key) {
          throw new Error('Vault is not unlocked. Please set the master password.');
        }
        console.log('Encrypting login data:', credential);
        const encryptedData = await CryptoUtilsV1.encryptDataAsync(this.key, credential.decryptedData!.toString());
        console.log('Encrypted data:', credential.initializationVector, encryptedData.initializationVector);
        credential.encryptedData = encryptedData.ciphertext;
        credential.initializationVector = encryptedData.initializationVector;
        credential.encryptionVersion = encryptedData.encryptionVersion;
        console.log('Encrypted data:', credential.initializationVector, encryptedData.initializationVector);
        return resolve(credential);
      } catch (error: any) {
        console.error('Error encrypting login data:', error);
        reject(new Error('Error encrypting login data:' + error ? error.message : 'Unknown error during encryption'));
      }
    });
  }

  async encryptAllCredentialsAsync(credentials: Credential[]): Promise<Credential[]> {
    return new Promise<Credential[]>(async (resolve, reject) => {
      try {
        if (!this.key) {
          throw new Error('Vault is not unlocked. Please set the master password.');
        }
        const encryptedCredentials = await Promise.all(credentials.map(this.encryptCredentialDataAsync.bind(this)));
        console.log('All credentials encrypted successfully');
        resolve(encryptedCredentials);
      } catch (error: any) {
        reject(error);
      }
    });
  }

  async decryptCredentialDataAsync(credential: Credential): Promise<Credential> {
    return new Promise<Credential>(async (resolve, reject) => {
      try {
        if (!this.key) {
          throw new Error('Vault is not unlocked. Please set the master password.');
        }
        const decryptDataString = await CryptoUtilsV1.decryptDataAsync(this.key, credential.encryptedData!, credential.initializationVector!);
        credential.decryptedData = DecryptedData.fromString(decryptDataString);
        console.log('Credential data decrypted successfully:', credential.decryptedData.toString());
        resolve(credential);
      } catch (error: any) {
        reject(error);
      }
    });
  }

  async decryptAllCredentialsAsync(logins: Credential[]): Promise<Credential[]> {
    return new Promise<Credential[]>(async (resolve, reject) => {
      try {
        if (!this.key) {
          throw new Error('Vault is not unlocked. Please set the master password.');
        }
        const decryptedLogins = await Promise.all(logins.map(this.decryptCredentialDataAsync.bind(this)));
        console.log('All logins decrypted successfully');
        resolve(decryptedLogins);
      } catch (error: any) {
        reject(error);
      }
    });
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
