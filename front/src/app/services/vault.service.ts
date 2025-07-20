import { Injectable } from '@angular/core';
import { base64ToUint8Array, CryptoUtilsV1 } from '../utils/crypto.utils';
import { Login } from '../entities/login';
import { Vault } from '../entities/vault';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateVaultDto } from '../entities/create/create-vault-dto';
import { UpdateVaultDto } from '../entities/update/update-vault-dto';

@Injectable({ providedIn: 'root' })
export class VaultService {
  private SALT_KEY_NAME = 'vault-salt';
  private derivedKey: CryptoKey | null = null;
  private apiEndpointV1 = environment.apiEndpoint + '/v1';

  constructor(private http: HttpClient) {
    this.derivedKey = null;
  }

  public async deriveAndSetDerivedKeyAsync(masterPassword: string): Promise<void> {
    try {
      const salt = this.getSalt();
      if (!salt || salt.length === 0) {
        throw new Error('Salt not set.');
      }
      this.derivedKey = await CryptoUtilsV1.deriveKeyFromPasswordAsync(masterPassword, salt);
    }
    catch (error) {
      console.log(error);
      throw new Error('Failed to set the key:' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  public setSalt(salt: string): void {
    if (!salt) {
      const errorMessage = 'Salt not found. Please contact support.';
      throw new Error(errorMessage);
    }

    localStorage.setItem(this.SALT_KEY_NAME, salt);
  }

  public getSalt(): Uint8Array {
    const storedSaltBase64 = localStorage.getItem(this.SALT_KEY_NAME);
    if (!storedSaltBase64) {
      const errorMessage = 'Salt not set. Please set the salt before setting the master password.';
      throw new Error(errorMessage);
    }
    return base64ToUint8Array(storedSaltBase64!);
  }

  public clearSalt(): void {
    console.log('Clearing salt');
    localStorage.removeItem(this.SALT_KEY_NAME);
  }

  public isUnlocked(): boolean {
    return this.derivedKey !== null;
  }

  public getDerivedKey(): CryptoKey {
    if (!this.derivedKey) {
      throw new Error('Vault is not unlocked. Please set the master password.');
    }
    return this.derivedKey;
  }
  
  public clearDerivedKey(): void {
    this.derivedKey = null;
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