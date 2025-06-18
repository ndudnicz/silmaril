export interface User {
    id: string;
    username: string;
    created: Date;
    updated: Date;
    salt: Uint8Array | null;
}