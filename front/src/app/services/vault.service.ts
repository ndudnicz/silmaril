// src/app/services/vault.service.ts

import { Injectable } from '@angular/core';
import { ToastWrapper } from '../utils/toast.wrapper';
import { CryptoUtilsV1 } from '../utils/crypto.utils';

@Injectable({ providedIn: 'root' })
export class VaultService {
  private static SALT_KEY_NAME = 'vault-salt';
  private salt: Uint8Array;
  private key: CryptoKey | null = null;
  private static instance: VaultService | null = null;

  constructor() {
    const storedSalt = localStorage.getItem(VaultService.SALT_KEY_NAME);
    if (storedSalt) {
      this.salt = new Uint8Array(JSON.parse(storedSalt));
    } else {
      const errorMessage = 'Salt not found. Please contact support. 1';
      ToastWrapper.error(errorMessage, null)
      throw new Error(errorMessage);
    }
  }

  public static setSalt(salt: Uint8Array | null): void {
    if (!salt) {
      const errorMessage = 'Salt not found. Please contact support. 2';
      ToastWrapper.error(errorMessage, null)
    }
    localStorage.setItem(VaultService.SALT_KEY_NAME, JSON.stringify(Array.from(salt!)));
  }

  public clearSalt(): void {
    localStorage.removeItem(VaultService.SALT_KEY_NAME);
  }

  public async setMasterPasswordAsync(password: string): Promise<void> {
    try {
      this.key = await CryptoUtilsV1.deriveKeyFromPasswordAsync(password, this.salt);
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
    this.key = null;
  }

}
