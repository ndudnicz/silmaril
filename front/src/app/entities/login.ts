import { Tag } from "./tag";

export interface Login {
    id: string;
    userId: string;
    encryptedName: string;
    encryptedPassword: string;
    encryptedIdentifier: string;
    encryptedUrl: string;
    encryptedNotes: string;
    tags: Tag[];
    created: Date;
    updated: Date;
}