import { uint8ArrayToBase64 } from "../../utils/crypto.utils";
import { Credential } from "../credential";

export class UpdateCredentialDto {
    constructor(
        public id: string,
        public deleted: boolean,
        public vaultId: string | null,
        public encryptedDataBase64?: string | null,
        public initializationVectorBase64?: string | null,
        public tagNames?: string[],
        public encryptionVersion?: number | null
    ) {}

    public static fromCredential(credential: Credential): UpdateCredentialDto {
        if (credential === null || credential === undefined || !credential.encryptedData || !credential.initializationVector) {
            throw new Error('Invalid credential object for UpdateCredentialDto: ' + credential.toString());
        }
        console.log('Creating UpdateCredentialDto from credential:', credential);

        return new UpdateCredentialDto(
            credential.id,
            credential.deleted,
            credential.vaultId,
            uint8ArrayToBase64(credential.encryptedData ?? new Uint8Array()),
            uint8ArrayToBase64(credential.initializationVector ?? new Uint8Array()),
            credential.tagNames,
            credential.encryptionVersion
        );
    }
}
