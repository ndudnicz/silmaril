// src/app/services/vault.service.ts

import { Injectable } from '@angular/core';
import { deriveKeyFromPasswordAsync, exportKeyAsync } from '../utils/crypto.utils';
import { ToastWrapper } from '../utils/toast.wrapper';

@Injectable({ providedIn: 'root' })
export class VaultService {
  private static SALT_KEY_NAME = 'vault-salt';
  private salt: Uint8Array;
  private key: CryptoKey | null = null;
  private static instance: VaultService | null = null;

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

  // public static getInstance(): VaultService {
  //   if (!VaultService.instance) {
  //     VaultService.instance = new VaultService();
  //   }
  //   return VaultService.instance;
  // }

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
      this.key = await deriveKeyFromPasswordAsync(password, this.salt);

      // let exportedKey = await exportKeyAsync(key);
      // const keyBase64 = btoa(String.fromCharCode(...new Uint8Array(exportedKey)));
      // console.log('VaultService.setMasterPassword keyBase64', keyBase64);

      // let keyString = JSON.stringify(await exportKeyAsync(key));
      // console.log('VaultService.setMasterPassword keyString', keyString);

      // this.key = 
      // localStorage.setItem(VaultService.ENCRYPTION_KEY_NAME, JSON.stringify(key));
      console.log('Master password set successfully', this.key);


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
