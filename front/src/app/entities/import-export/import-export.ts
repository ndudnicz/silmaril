export interface ImportExport {
    magic: string;
    encryptedDataBase64: string;
}

export enum ImportExportFormat {
    JSON = 'json',
    CSV = 'csv'
}

export class ImportExportJson implements ImportExport {
    static readonly MAGIC = 'SilmarilEncryptedExport';
    magic: string;
    encryptedDataBase64: string;
    saltBase64: string;
    initialicationVectorBase64: string;

    constructor(
        magic: string,
        encryptedDataBase64: string,
        saltBase64: string,
        initialicationVectorBase64: string
    ) {
        this.magic = magic;
        this.encryptedDataBase64 = encryptedDataBase64;
        this.saltBase64 = saltBase64;
        this.initialicationVectorBase64 = initialicationVectorBase64;
    }

    static fromString(jsonString: string): ImportExportJson {
        const jsonObject = JSON.parse(jsonString);
        if (jsonObject.magic !== ImportExportJson.MAGIC) {
            throw new Error(`Invalid magic string: ${jsonObject.magic}`);
        }
        return ImportExportJson.fromObject(jsonObject);
    }

    static fromObject(obj: any): ImportExportJson {
        if (obj.magic !== ImportExportJson.MAGIC) {
            throw new Error(`Invalid magic string: ${obj.magic}`);
        }
        return new ImportExportJson(
            obj.magic,
            obj.encryptedDataBase64,
            obj.saltBase64,
            obj.initialicationVectorBase64
        );
    }

    toString(): string {
        return JSON.stringify(this);
    }
}