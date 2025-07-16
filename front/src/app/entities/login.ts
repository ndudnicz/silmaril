import { base64ToUint8Array } from "../utils/crypto.utils";
import { DecryptedData } from "./decrypted-data";

export class Login {
    public encryptedData?: Uint8Array | null;
    public decryptedData?: DecryptedData | null;
    public initializationVector?: Uint8Array | null;
    // The following properties are used for UI purposes
    public selected: boolean = false;

    constructor(
        public id: string,
        public userId: string,
        public vaultId: string | null,
        public deleted: boolean,
        public created: Date,
        public encryptedDataBase64?: string | null,
        public initializationVectorBase64?: string | null,
        public tagNames: string[] = [],
        public updated?: Date,
        public encryptionVersion?: number | null
    ) {
        this.encryptedData = encryptedDataBase64 ? base64ToUint8Array(encryptedDataBase64) : null;
        this.initializationVector = initializationVectorBase64 ? base64ToUint8Array(initializationVectorBase64) : null;
    }

    public static fromObject(obj: any): Login {
        if (!obj || typeof obj !== 'object') {
            throw new Error('Invalid object for Login');
        }
        if (typeof obj.id !== 'string' || typeof obj.userId !== 'string') {
            throw new Error('Invalid properties in object for Login');
        }
        return new Login(
            obj.id || '',
            obj.userId || '',
            obj.vaultId,
            obj.deleted || false,
            new Date(obj.created),
            obj.encryptedDataBase64 || undefined,
            obj.initializationVectorBase64 || undefined,
            Array.isArray(obj.tagNames) ? obj.tagNames : [],
            obj.updated ? new Date(obj.updated) : undefined,
            typeof obj.encryptionVersion === 'number' ? obj.encryptionVersion : undefined
        );
    }

    public copy(): Login {
        return new Login(
            this.id,
            this.userId,
            this.vaultId,
            this.deleted,
            new Date(this.created),
            this.encryptedDataBase64,
            this.initializationVectorBase64,
            [...this.tagNames],
            this.updated ? new Date(this.updated) : undefined,
            this.encryptionVersion
        );
    }

    public toString(): string {
        return JSON.stringify(this);
    }
}