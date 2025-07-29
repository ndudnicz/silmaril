import { SignedData } from "./signed-data";

export enum ImportExportFormat {
    JSON = 'json',
    CSV = 'csv'
}

export class ImportExportJson {
    signatureBase64: string;
    signedData: SignedData;

    constructor(
        signatureBase64: string,
        signedData: SignedData
    ) {
        this.signatureBase64 = signatureBase64;
        this.signedData = signedData;
    }

    static fromString(jsonString: string): ImportExportJson {
        const jsonObject = JSON.parse(jsonString);
        return ImportExportJson.fromObject(jsonObject);
    }

    static fromObject(obj: any): ImportExportJson {
        return new ImportExportJson(
            obj.signatureBase64,
            obj.signedData as SignedData
        );
    }

    toString(): string {
        return JSON.stringify(this);
    }
}