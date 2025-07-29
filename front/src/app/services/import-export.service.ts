import { Injectable } from "@angular/core";
import { ImportExportJson } from "../entities/import-export/import-export";
import { base64ToUint8Array, CryptoUtilsV1, EncryptionResult, uint8ArrayToBase64 } from "../utils/crypto.utils";
import { Login } from "../entities/login";
import { combineLatest, from, map, Observable, of, switchMap, take } from "rxjs";
import { DecryptedData } from "../entities/decrypt-data/decrypted-data";
import { LoginService } from "./login.service";
import { CreateLoginDto } from "../entities/create/create-login-dto";
import { VaultService } from "./vault.service";
import { EncryptionService } from "./encryption.service";
import { SignedData } from "../entities/import-export/signed-data";

@Injectable({ providedIn: 'root' })
export class ImportExportService {

    constructor(
        private loginService: LoginService,
        private vaultService: VaultService,
        private encryptionService: EncryptionService
    ) { }

    public exportLoginsAsCsv$(): Observable<boolean> {
        return this.loginService.getLogins$().pipe(
            switchMap((logins: Login[]) => from(this.encryptionService.decryptAllLoginsAsync(logins, this.vaultService.getDerivedKey()))),

            switchMap((logins: Login[]) => this.exportDecryptedDataAsCsv$(logins.map(l => l.decryptedData!)))
        );
    }

    public exportEncryptedJson$(encryptionPassword: string): Observable<boolean> {
        return this.loginService.getLogins$().pipe(
            switchMap((logins: Login[]) => from(this.encryptionService.decryptAllLoginsAsync(logins, this.vaultService.getDerivedKey()))),

            switchMap((logins: Login[]) => this.exportLoginsAsEncryptedJson$(logins.map(l => l.decryptedData!), encryptionPassword)),

            switchMap((importExportJson: ImportExportJson) => {
                const fileName = `logins_export_${new Date().toISOString()}`;
                return this.downloadJsonFile$(importExportJson, fileName);
            })
        );
    }

    private exportLoginsAsEncryptedJson$(DecryptedDataArray: DecryptedData[], masterPassword: string): Observable<ImportExportJson> {
        const salt = CryptoUtilsV1.generateRandomBytes(CryptoUtilsV1.SALT_LENGTH_IN_BYTES);

        return this.getDerivedKeysFromMasterPassword$(
            masterPassword,
            uint8ArrayToBase64(salt))
            .pipe(
                switchMap((derivedKeys) => this.encryptData$(derivedKeys, salt, DecryptedDataArray))
            );
    }

    private encryptData$(
        derivedKeys: { aesKey: CryptoKey; hmacKey: CryptoKey },
        salt: Uint8Array,
        decryptedDataArray: DecryptedData[]): Observable<ImportExportJson> {
        return from(CryptoUtilsV1.encryptDataAsync(derivedKeys.aesKey, JSON.stringify(decryptedDataArray)))
            .pipe(switchMap((encryptionResult: EncryptionResult) => this.signEncryptedData$(derivedKeys.hmacKey, salt, encryptionResult)));
    }

    private signEncryptedData$(
        derivedKey: CryptoKey,
        salt: Uint8Array,
        encryptionResult: EncryptionResult): Observable<ImportExportJson> {
        return from(CryptoUtilsV1.signDataAsync(
            derivedKey,
            JSON.stringify(this.mapSignedData(encryptionResult, salt)))).pipe(
            switchMap((signatureBase64: string) => of(this.mapImportExportJson$(
                encryptionResult,
                salt,
                signatureBase64
            ))));
    }

    private mapSignedData(
        encryptionResult: EncryptionResult,
        salt: Uint8Array
    ): SignedData {
        return {
            encryptedDataBase64: uint8ArrayToBase64(encryptionResult.ciphertext),
            saltBase64: uint8ArrayToBase64(salt),
            initialicationVectorBase64: uint8ArrayToBase64(encryptionResult.initializationVector)
        };
    }

    private mapImportExportJson$(
        encryptionResult: EncryptionResult,
        salt: Uint8Array,
        signatureBase64: string
    ): ImportExportJson {
        return new ImportExportJson(
            signatureBase64,
            this.mapSignedData(encryptionResult, salt)
        );
    }

    private exportDecryptedDataAsCsv$(decryptedDataArray: DecryptedData[]): Observable<boolean> {
        return this.downloadCsvFile$(decryptedDataArray, `logins_export_${new Date().toISOString()}`);
    }

    public importLoginsFromCsv() {

    }

    public importLoginsFromEncryptedJson$(
        importExportJson: ImportExportJson,
        masterPassword: string
    ): Observable<Login[]> {
        return this.getDerivedKeysFromMasterPassword$(masterPassword, importExportJson.signedData.saltBase64).pipe(
            switchMap((derivedKeys) => {
                return from(CryptoUtilsV1.verifySignatureAsync(
                    derivedKeys.hmacKey,
                    JSON.stringify(importExportJson.signedData),
                    importExportJson.signatureBase64
                )).pipe(
                    map((isValid: boolean) => {
                        if (!isValid) {
                            throw new Error('Invalid signature. The data may have been tampered with or the wrong password was used.');
                        }
                        return derivedKeys;
                    })
                );
            }),
            
            switchMap((derivedKeys) => this.decryptDataString$(derivedKeys,
                importExportJson.signedData.encryptedDataBase64,
                importExportJson.signedData.initialicationVectorBase64)),

            switchMap((decryptedDataString: string) => this.getDecryptedDataArrayString$(decryptedDataString)),

            switchMap((decryptedDataArrayString: string[]) => {
                const vaultDerivedKey = this.vaultService.getDerivedKey();
                if (!vaultDerivedKey) {
                    throw new Error('Vault is not unlocked. Please set the master password.');
                }
                return this.encryptWithCurrentDerivedKeyData$(vaultDerivedKey, decryptedDataArrayString)
            }),

            switchMap((encryptionResults: EncryptionResult[]) => this.mapCreateLoginDtos$(encryptionResults)),

            switchMap((createLoginDtos: CreateLoginDto[]) => this.createLogins$(createLoginDtos)),

            take(1)
        );
    }

    private getDerivedKeysFromMasterPassword$(masterPassword: string, saltBase64: string): Observable<{ aesKey: CryptoKey; hmacKey: CryptoKey }> {
        const salt = base64ToUint8Array(saltBase64);

        const aesKey$ = from(CryptoUtilsV1.deriveAesKeyFromPasswordAsync(masterPassword, salt));
        const hmacKey$ = from(CryptoUtilsV1.deriveHmacKeyFromPasswordAsync(masterPassword, salt));

        return combineLatest([aesKey$, hmacKey$]).pipe(
            map(([aesKey, hmacKey]) => ({ aesKey, hmacKey }))
        );
    }

    private decryptDataString$(
        derivedKeys: { aesKey: CryptoKey; hmacKey: CryptoKey },
        encryptedDataBase64: string,
        initializationVectorBase64: string
    ): Observable<string> {
        return from(CryptoUtilsV1.decryptDataAsync(
            derivedKeys.aesKey,
            base64ToUint8Array(encryptedDataBase64),
            base64ToUint8Array(initializationVectorBase64)
        )).pipe(
            map((decryptedDataString: string) => decryptedDataString)
        );
    }

    private getDecryptedDataArrayString$(decryptedDataArrayString: string): Observable<string[]> {
        const array = JSON.parse(decryptedDataArrayString);
        if (!Array.isArray(array)) {
            throw new Error('Decrypted data is not an array');
        }
        return of(array);
    }

    private encryptWithCurrentDerivedKeyData$(derivedKey: CryptoKey, decryptedDataStringArray: string[]): Observable<EncryptionResult[]> {
        return from(CryptoUtilsV1.encryptDataBulkAsync(derivedKey, decryptedDataStringArray));
    }

    private mapCreateLoginDtos$(encryptionResults: EncryptionResult[]): Observable<CreateLoginDto[]> {
        return of(encryptionResults.map((result: EncryptionResult) => {
            return {
                vaultId: null,
                encryptedDataBase64: uint8ArrayToBase64(result.ciphertext),
                initializationVectorBase64: uint8ArrayToBase64(result.initializationVector),
                tagNames: [],
                encryptionVersion: result.encryptionVersion
            } as CreateLoginDto;
        }));
    }

    private createLogins$(createLoginDtos: CreateLoginDto[]): Observable<Login[]> {
        return this.loginService.createLogins$(createLoginDtos);
    }

    public downloadJsonFile$(data: any, filename: string): Observable<boolean> {
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);

        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `${filename}.json`;
        anchor.click();

        window.URL.revokeObjectURL(url);
        return of(true)
    }

    public downloadCsvFile$(data: any, filename: string): Observable<boolean> {
        const csvContent: string = this.convertToCSV(data);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.csv`;
        a.click();

        URL.revokeObjectURL(url);
        return of(true);
    }

    private convertToCSV(data: any[]): string {
        if (!data.length) return '';

        const header = Object.keys(data[0]).join(',');
        const rows = data.map(row => {
            return Object.values(row)
                .map(value => `"${String(value).replace(/"/g, '""')}"`)
                .join(',');
        });
        return [header, ...rows].join('\r\n');
    }
}