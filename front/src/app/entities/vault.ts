export interface Vault {
    id: string;
    name: string;
    created: Date;
    updated?: Date;
    userId: string;
}

export interface CreateVaultDto {
    name: string;
}

export interface UpdateVaultDto {
    name: string;
}