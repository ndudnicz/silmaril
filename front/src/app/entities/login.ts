import { base64ToUint8Array, uint8ArrayToBase64 } from "../utils/crypto.utils";

export class Login {
    public encryptedData?: Uint8Array | null;
    public decryptedData?: DecryptedData | null;
    public initializationVector?: Uint8Array | null;

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

export class DecryptedData {
    title: string;
    identifier: string;
    password: string;
    url: string;
    notes: string;

    constructor(title: string, identifier: string, password: string, url: string, notes: string) {
        this.title = title;
        this.identifier = identifier;
        this.password = password;
        this.url = url;
        this.notes = notes;
    }

    public static fromObject(obj: any): DecryptedData {
        if (!obj || typeof obj !== 'object') {
            throw new Error('Invalid object for DecryptedData');
        }
        if (typeof obj.title !== 'string' || typeof obj.identifier !== 'string' ||
            typeof obj.password !== 'string' || typeof obj.url !== 'string' ||
            typeof obj.notes !== 'string') {
            throw new Error('Invalid properties in object for DecryptedData');
        }
        return new DecryptedData(
            obj.title || '',
            obj.identifier || '',
            obj.password || '',
            obj.url || '',
            obj.notes || ''
        );
    }

    public static fromString(data: string): DecryptedData {
        try {
            const obj = JSON.parse(data);
            return DecryptedData.fromObject(obj);
        } catch (error) {
            console.error('Failed to parse DecryptedData from string:', error);
            throw new Error(error instanceof Error ? error.message : 'Unknown error');
        }
    }

    public toString(): string {
        return JSON.stringify(this);
    }
}

export interface CreateLoginDto {
    vaultId: string | null;
    encryptedDataBase64: string;
    initializationVectorBase64: string;
    tagNames: string[];
    encryptionVersion?: number | null;
}

export class UpdateLoginDto {
    constructor(
        public id: string,
        public deleted: boolean,
        public vaultId: string | null,
        public encryptedDataBase64?: string | null,
        public initializationVectorBase64?: string | null,
        public tagNames?: string[],
        public encryptionVersion?: number | null
    ) {}

    public static fromLogin(login: Login): UpdateLoginDto {
        if (login === null || login === undefined || !login.encryptedData || !login.initializationVector) {
            throw new Error('Invalid login object for UpdateLoginDto: ' + login.toString());
        }
        console.log('Creating UpdateLoginDto from login:', login);
        
        return new UpdateLoginDto(
            login.id,
            login.deleted,
            login.vaultId,
            uint8ArrayToBase64(login.encryptedData ?? new Uint8Array()),
            uint8ArrayToBase64(login.initializationVector ?? new Uint8Array()),
            login.tagNames,
            login.encryptionVersion
        );
    }
}