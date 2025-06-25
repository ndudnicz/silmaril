// src/app/services/vault.service.ts

import { Injectable } from '@angular/core';
import { base64ToUint8Array, CryptoUtilsV1 } from '../utils/crypto.utils';

@Injectable({ providedIn: 'root' })
export class VaultService {
  private SALT_KEY_NAME = 'vault-salt';
  // private salt!: Uint8Array | null;
  private key: CryptoKey | null = null;

  constructor() {
    // const storedSalt = localStorage.getItem(VaultService.SALT_KEY_NAME);
    // if (storedSalt) {
    //   this.salt = new Uint8Array(JSON.parse(storedSalt));
    // } else {
    //   const errorMessage = 'Salt not found. Please contact support. 1';
    //   ToastWrapper.error(errorMessage, null)
    //   throw new Error(errorMessage);
    // }
  }

  public setSalt(salt: string): void {
    console.log(`Setting salt: ${salt}`, typeof salt);
    
    if (!salt) {
      const errorMessage = 'Salt not found. Please contact support.';
      // ToastWrapper.error(errorMessage, null)
      throw new Error(errorMessage);
    }
    // this.salt = salt!;
    
    localStorage.setItem(this.SALT_KEY_NAME, salt);
  }

  public clearSalt(): void {
    console.log('Clearing salt');
    localStorage.removeItem(this.SALT_KEY_NAME);
    // this.salt = null;
  }

  public async setKeyAsync(masterPassword: string): Promise<void> {
    const storedSaltBase64 = localStorage.getItem(this.SALT_KEY_NAME);

    if (!storedSaltBase64) {
      const errorMessage = 'Salt not set. Please set the salt before setting the master password.';
      throw new Error(errorMessage);
    }
    try {
      console.log(`Setting master password with salt b64: ${storedSaltBase64}`);
      const saltUint8Array = base64ToUint8Array(storedSaltBase64);
      console.log(`Salt Uint8Array: ${saltUint8Array}`);
      this.key = await CryptoUtilsV1.deriveKeyFromPasswordAsync(masterPassword, saltUint8Array);
    }
    catch (error) {
      console.log(error);
    }
  }

  public isUnlocked(): boolean {
    return this.key !== null;
  }

  getKey(): CryptoKey | null {
    return this.key;
  }

  clearKey(): void {
    console.log('Clearing key');
    this.key = null;
  }
}
