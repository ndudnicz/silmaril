// src/app/utils/crypto.util.ts

export class CryptoUtilsV1 {
  static async deriveKeyFromPasswordAsync(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100_000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
  }

  static async exportKeyAsync(key: CryptoKey): Promise<ArrayBuffer> {
    return crypto.subtle.exportKey('raw', key);
  }

  static async importKeyAsync(rawKey: ArrayBuffer): Promise<CryptoKey> {
    return await crypto.subtle.importKey(
      'raw',
      rawKey,
      { name: 'AES-GCM' },
      true,
      ['encrypt', 'decrypt']
    );
  }


  static async decryptDataAsync(key: CryptoKey | null, encryptedData: Uint8Array, initializationVector: Uint8Array): Promise<string> {
    console.log(`Decrypting data with key: ${key ? 'exists' : 'null'}`, encryptedData, initializationVector);
    
    if (!key) throw new Error('Vault is locked');

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: initializationVector },
      key!,
      encryptedData
    );

    return new TextDecoder().decode(decrypted);
  }

  static async encryptDataAsync(key: CryptoKey | null, plaintext: string): Promise<{ ciphertext: Uint8Array; initializationVector: Uint8Array, encryptionVersion: number }> {
    if (!key) throw new Error('Vault is locked');

    const initializationVector = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(plaintext);

    const buffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: initializationVector },
      key!,
      encoded
    );

    return { ciphertext: new Uint8Array(buffer), initializationVector, encryptionVersion: 1 };
  }
}

export function uint8ArrayToBase64(uint8Array: Uint8Array): string {
  return btoa(String.fromCharCode(...uint8Array));
}

export function base64ToUint8Array(base64: string): Uint8Array {
  base64 = base64.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}