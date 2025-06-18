// src/app/services/vault.service.ts

import { Injectable } from '@angular/core';
import { deriveKeyFromPasswordAsync, exportKeyAsync } from '../utils/crypto.utils';
import { ToastWrapper } from '../utils/toast.wrapper';

@Injectable({ providedIn: 'root' })
export class VaultService {
  private static ENCRYPTION_KEY_NAME = 'vault-encryption-key';
  private static SALT_KEY_NAME = 'vault-salt';
  private salt: Uint8Array = new Uint8Array(); // Peut venir du serveur ou être stocké localement de manière sûre

  constructor() {
    // Exemple : récupère ou initialise le sel
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

  public async setMasterPassword(password: string): Promise<void> {
    try {
    const key = await deriveKeyFromPasswordAsync(password, this.salt);
    
    let extractedKey = await exportKeyAsync(key);
    let keyString = JSON.stringify(await exportKeyAsync(key));
    console.log('VaultService.setMasterPassword keyString', keyString);
    
    localStorage.setItem(VaultService.ENCRYPTION_KEY_NAME, JSON.stringify(key));
    console.log('Master password set successfully', localStorage.getItem(VaultService.ENCRYPTION_KEY_NAME));
    

    }
    catch (error) {
      console.log(error);
      
    }

  }

  public static isUnlocked(): boolean {
    return localStorage.getItem(VaultService.ENCRYPTION_KEY_NAME) !== null;
  }

  getKey(): CryptoKey | null {
    if (localStorage.getItem(VaultService.ENCRYPTION_KEY_NAME) === null) {
      return null;
    }
    return JSON.parse(localStorage.getItem(VaultService.ENCRYPTION_KEY_NAME)!) as CryptoKey;
  }

  clearKey(): void {
    localStorage.removeItem(VaultService.ENCRYPTION_KEY_NAME);
  }

  async decryptData(encryptedData: ArrayBuffer, iv: Uint8Array): Promise<string> {
    if (!this.getKey()) throw new Error('Vault is locked');

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      this.getKey()!,
      encryptedData
    );
    return new TextDecoder().decode(decrypted);
  }

  async encryptData(plaintext: string): Promise<{ ciphertext: ArrayBuffer; iv: Uint8Array }> {
    if (!this.getKey()) throw new Error('Vault is locked');

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(plaintext);

    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      this.getKey()!,
      encoded
    );

    return { ciphertext, iv };
  }
}
