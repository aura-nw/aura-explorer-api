
import { ModuleMetadata, Provider } from '@nestjs/common';
import { EncryptionOptions } from './encryption.interface';

export const ENCRYPTION_CONFIG_OPTIONS = 'ENCRYPTION_CONFIG_OPTIONS';

export interface EncryptionAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
    useFactory: (...args: any[]) => Promise<EncryptionOptions> | EncryptionOptions;
    inject?: any[];
    providers?: Provider[];
}
