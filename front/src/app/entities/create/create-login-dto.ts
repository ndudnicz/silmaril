export interface CreateLoginDto {
    vaultId: string | null;
    encryptedDataBase64: string;
    initializationVectorBase64: string;
    tagNames: string[];
    encryptionVersion?: number | null;
}