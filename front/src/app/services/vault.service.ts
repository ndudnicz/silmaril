// src/app/services/vault.service.ts

import { Injectable } from '@angular/core';
import { base64ToUint8Array, CryptoUtilsV1 } from '../utils/crypto.utils';
import { DecryptedData, Login } from '../entities/login';

@Injectable({ providedIn: 'root' })
export class VaultService {
  private SALT_KEY_NAME = 'vault-salt';
  private key: CryptoKey | null = null;

  constructor() {
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
      throw new VaultServiceError('Failed to set the key:' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  public isUnlocked(): boolean {
    return this.key !== null;
  }

  public getKey(): CryptoKey | null {
    return this.key;
  }
  
  public clearKey(): void {
    console.log('Clearing key');
    this.key = null;
  }

  async encryptLoginDataAsync(login: Login): Promise<Login> {
    return new Promise<Login>(async (resolve, reject) => {
      try {
        if (!this.key) {
          throw new Error('Vault is not unlocked. Please set the master password.');
        }
        console.log('Encrypting login data:', login);
        
        const encryptedData = await CryptoUtilsV1.encryptDataAsync(this.key, login.decryptedData!.toString());
        console.log('Encrypted data:', login.initializationVector, encryptedData.initializationVector);
        
        login.encryptedData = encryptedData.ciphertext;
        login.initializationVector = encryptedData.initializationVector;
        login.encryptionVersion = encryptedData.encryptionVersion;
        console.log('Encrypted data:', login.initializationVector, encryptedData.initializationVector);
        
        // login.decryptedData = null;
        return resolve(login);
      } catch (error: any) {
        console.error('Error encrypting login data:', error);
        reject(new VaultServiceError('Error encrypting login data:' + error ? error.message : 'Unknown error during encryption'));
      }
    });
  }

  async encryptAllLoginsAsync(logins: Login[]): Promise<Login[]> {
    return new Promise<Login[]>(async (resolve, reject) => {
      try {
        if (!this.key) {
          throw new VaultServiceError('Vault is not unlocked. Please set the master password.');
        }
        const encryptedLogins = await Promise.all(logins.map(this.encryptLoginDataAsync.bind(this)));
        console.log('All logins encrypted successfully');
        return resolve(encryptedLogins);
      } catch (error: any) {
        console.error('Error encrypting logins:', error);
        reject(new VaultServiceError('Error encrypting logins:' + error ? error.message : 'Unknown error during encryption'));
      }
    });
  }

  async decryptLoginDataAsync(login: Login): Promise<Login> {
    return new Promise<Login>(async (resolve, reject) => {
      try {
        if (!this.key) {
          throw new VaultServiceError('Vault is not unlocked. Please set the master password.');
        }
        const decryptDataString = await CryptoUtilsV1.decryptDataAsync(this.key, login.encryptedData!, login.initializationVector!);
        login.decryptedData = DecryptedData.fromString(decryptDataString);
        console.log('Login data decrypted successfully:', login.decryptedData.toString());
        return resolve(login);
      } catch (error: any) {
        console.error('Error decrypting login data:', error);
        reject(new VaultServiceError('Error decrypting login data:' + error ? error.message : 'Unknown error during decryption'));
      }
    });
  }

  async decryptAllLoginsAsync(logins: Login[]): Promise<Login[]> {
    return new Promise<Login[]>(async (resolve, reject) => {
      try {
        if (!this.key) {
          throw new VaultServiceError('Vault is not unlocked. Please set the master password.');
        }
        const decryptedLogins = await Promise.all(logins.map(this.decryptLoginDataAsync.bind(this)));
        console.log('All logins decrypted successfully');
        return resolve(decryptedLogins);
      } catch (error: any) {
        console.error('Error decrypting logins:', error);
        reject(new VaultServiceError('Error decrypting logins:' + error ? error.message : 'Unknown error during decryption'));
      }
    });
  }
}

export class VaultServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VaultServiceError';
  }
}