import { Tag } from "./tag";

export interface LoginEncrypted {
    id: string;
    userId: string;
    encryptedData?: Uint8Array;
    encryptionVersion?: number;
    tags: Tag[];
    created: Date;
    updated?: Date;
}

export interface LoginDecrypted {
    id: string;
    userId: string;
    data?: DecryptedData;
    encryptionVersion?: number;
    tags: Tag[];
    created: Date;
    updated?: Date;
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
        return new DecryptedData(
            obj.title || '',
            obj.identifier || '',
            obj.password || '',
            obj.url || '',
            obj.notes || ''
        );
    }
}