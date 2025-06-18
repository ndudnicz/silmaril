import { Tag } from "./tag";

export interface Login {
    id: string;
    userId: string;
    encryptedData?: Uint8Array;
    encryptionVersion?: number;
    tags: Tag[];
    created: Date;
    updated: Date;
}