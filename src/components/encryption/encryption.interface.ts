import { PlaintextType } from "aws-sdk/clients/kms";

export interface EncryptionOptions {
    key: PlaintextType;
}