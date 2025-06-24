import { base64ToUint8Array } from "../utils/crypto.utils";
import { Tag } from "./tag";

export class Login {
    id: string;
    userId: string;
    encryptedDataBase64?: string;
    encryptedData?: Uint8Array;
    decryptedData?: DecryptedData;
    encryptionVersion?: number;
    initializationVector?: Uint8Array;
    initializationVectorBase64?: string;
    tagNames: string[];
    created: Date;
    updated?: Date;

    constructor(id: string, userId: string, encryptedDataBase64?: string, initializationVectorBase64?: string, tagNames: string[] = [], created?: Date, updated?: Date, encryptionVersion?: number) {
        this.id = id;
        this.userId = userId;
        this.encryptedDataBase64 = encryptedDataBase64;
        this.encryptedData = encryptedDataBase64 ? base64ToUint8Array(encryptedDataBase64) : undefined;
        this.initializationVector = initializationVectorBase64 ? base64ToUint8Array(initializationVectorBase64) : undefined;
        this.initializationVectorBase64 = initializationVectorBase64;
        this.tagNames = tagNames;
        this.created = created || new Date();
        this.updated = updated;
        this.encryptionVersion = encryptionVersion;
    }

    public static fromObject(obj: any): Login {
        if (!obj || typeof obj !== 'object') {
            throw new Error('Invalid object for Login');
        }
        if (typeof obj.id !== 'string' || typeof obj.userId !== 'string') {
            throw new Error('Invalid properties in object for Login');
        }
        return new Login(
            obj.id,
            obj.userId,
            obj.encryptedDataBase64 || '',
            obj.initializationVectorBase64 || '',
            obj.tags || [],
            obj.created ? new Date(obj.created) : undefined,
            obj.updated ? new Date(obj.updated) : undefined,
            obj.encryptionVersion
        );
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
    encryptedDataBase64: string;
    initializationVectorBase64: string;
    tagNames: string[];
    encryptionVersion?: number;
}

export interface UpdateLoginDto {
    id: string;
    encryptedDataBase64?: string;
    initializationVectorBase64?: string;
    tagNames?: string[];
    encryptionVersion?: number;
}