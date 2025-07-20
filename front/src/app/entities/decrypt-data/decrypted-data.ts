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