import { uint8ArrayToBase64 } from "../../utils/crypto.utils";
import { Login } from "../login";

export class UpdateLoginDto {
    constructor(
        public id: string,
        public deleted: boolean,
        public vaultId: string | null,
        public encryptedDataBase64?: string | null,
        public initializationVectorBase64?: string | null,
        public tagNames?: string[],
        public encryptionVersion?: number | null
    ) {}

    public static fromLogin(login: Login): UpdateLoginDto {
        if (login === null || login === undefined || !login.encryptedData || !login.initializationVector) {
            throw new Error('Invalid login object for UpdateLoginDto: ' + login.toString());
        }
        console.log('Creating UpdateLoginDto from login:', login);
        
        return new UpdateLoginDto(
            login.id,
            login.deleted,
            login.vaultId,
            uint8ArrayToBase64(login.encryptedData ?? new Uint8Array()),
            uint8ArrayToBase64(login.initializationVector ?? new Uint8Array()),
            login.tagNames,
            login.encryptionVersion
        );
    }
}