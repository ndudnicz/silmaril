export interface User {
    id: string;
    username: string;
    created: Date;
    updated?: Date;
    saltBase64: string;
}