import { Injectable } from '@angular/core';
import { DecryptedData } from '../entities/decrypt-data/decrypted-data';
import { Login } from '../entities/login';
import { CryptoUtilsV1 } from '../utils/crypto.utils';

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {

  constructor() { }

    async encryptLoginDataAsync(login: Login, derivedKey: CryptoKey): Promise<Login> {
    return new Promise<Login>(async (resolve, reject) => {
      try {
        if (!derivedKey) {
          throw new Error('Vault is not unlocked. Please set the master password.');
        }
        console.log('Encrypting login data:', login);
        const encryptedData = await CryptoUtilsV1.encryptDataAsync(derivedKey, login.decryptedData!.toString());
        console.log('Encrypted data:', login.initializationVector, encryptedData.initializationVector);
        login.encryptedData = encryptedData.ciphertext;
        login.initializationVector = encryptedData.initializationVector;
        login.encryptionVersion = encryptedData.encryptionVersion;
        console.log('Encrypted data:', login.initializationVector, encryptedData.initializationVector);
        return resolve(login);
      } catch (error: any) {
        console.error('Error encrypting login data:', error);
        reject(new Error('Error encrypting login data:' + error ? error.message : 'Unknown error during encryption'));
      }
    });
  }

  async encryptAllLoginsAsync(logins: Login[], derivedKey: CryptoKey): Promise<Login[]> {
    return new Promise<Login[]>(async (resolve, reject) => {
      try {
        if (!derivedKey) {
          throw new Error('Vault is not unlocked. Please set the master password.');
        }
        const encryptedLogins = await Promise.all(
          logins.map((login) => this.encryptLoginDataAsync(login, derivedKey))
        );
        console.log('All logins encrypted successfully');
        resolve(encryptedLogins);
      } catch (error: any) {
        reject(error);
      }
    });
  }

  async decryptLoginDataAsync(login: Login, derivedKey: CryptoKey): Promise<Login> {
    return new Promise<Login>(async (resolve, reject) => {
      try {
        if (!derivedKey) {
          throw new Error('Vault is not unlocked. Please set the master password.');
        }
        const decryptDataString = await CryptoUtilsV1.decryptDataAsync(derivedKey, login.encryptedData!, login.initializationVector!);
        login.decryptedData = DecryptedData.fromString(decryptDataString);
        console.log('Login data decrypted successfully:', login.decryptedData.toString());
        resolve(login);
      } catch (error: any) {
        reject(error);
      }
    });
  }

  async decryptAllLoginsAsync(logins: Login[], derivedKey: CryptoKey): Promise<Login[]> {
    return new Promise<Login[]>(async (resolve, reject) => {
      try {
        if (!derivedKey) {
          throw new Error('Vault is not unlocked. Please set the master password.');
        }
        const decryptedLogins = await Promise.all(logins.map((login) => this.decryptLoginDataAsync(login, derivedKey)));
        console.log('All logins decrypted successfully');
        resolve(decryptedLogins);
      } catch (error: any) {
        reject(error);
      }
    });
  }
}
