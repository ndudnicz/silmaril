export interface EncryptionResult {
  ciphertext: Uint8Array;
  initializationVector: Uint8Array;
  encryptionVersion: number;
}

export class CryptoUtilsV1 {
  // The NIST recommends a 16-byte salt length for deriving the user's Master Password key using PBKDF2 on the frontend.
  static readonly SALT_LENGTH_IN_BYTES = 16;

  static async deriveAesKeyFromPasswordAsync(password: string, salt: Uint8Array): Promise<CryptoKey> {
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

  static async deriveHmacKeyFromPasswordAsync(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
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
      {
        name: 'HMAC',
        hash: 'SHA-256',
        length: 256,
      },
      false,
      ['sign', 'verify']
    );
  }

  static async decryptDataAsync(aesDerivedKey: CryptoKey | null, encryptedData: Uint8Array, initializationVector: Uint8Array): Promise<string> {
    if (!aesDerivedKey) throw new Error('Vault is locked');

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: initializationVector },
      aesDerivedKey!,
      encryptedData
    );

    return new TextDecoder().decode(decrypted);
  }

  static async encryptDataAsync(aesDerivedKey: CryptoKey | null, plaintext: string): Promise<EncryptionResult> {
    if (!aesDerivedKey) throw new Error('Vault is locked');

    const initializationVector = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(plaintext);

    const buffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: initializationVector },
      aesDerivedKey!,
      encoded
    );

    return { ciphertext: new Uint8Array(buffer), initializationVector, encryptionVersion: 1 };
  }

  static async encryptDataBulkAsync(aesDerivedKey: CryptoKey | null, data: string[]): Promise<EncryptionResult[]> {
    return await Promise.all(data.map(item => this.encryptDataAsync(aesDerivedKey, item)));
  }

  public static generateRandomBytes(length: number): Uint8Array {
    const randomBytes = new Uint8Array(length);
    crypto.getRandomValues(randomBytes);
    return randomBytes;
  }

  public static async signDataAsync(hmacDerivedKey: CryptoKey, data: string): Promise<string> {
    console.log('Signing data:', data);

    const encoder = new TextEncoder();
    let signature: ArrayBuffer;
    try {
      signature = await crypto.subtle.sign(
        { name: 'HMAC', hash: 'SHA-256' },
        hmacDerivedKey,
        encoder.encode(data)
      );
    } catch (error) {
      console.error('Error signing data:', error);
      throw new Error('Failed to sign data: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }

    return uint8ArrayToBase64(new Uint8Array(signature));
  }

  public static async verifySignatureAsync(hmacDerivedKey: CryptoKey, data: string, signatureBase64: string): Promise<boolean> {
    const encoder = new TextEncoder();
    const signatureArray = base64ToUint8Array(signatureBase64);
    return crypto.subtle.verify(
      { name: 'HMAC', hash: 'SHA-256' },
      hmacDerivedKey,
      signatureArray,
      encoder.encode(data)
    );
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