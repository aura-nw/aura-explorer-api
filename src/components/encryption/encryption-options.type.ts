import { ModuleMetadata, Provider } from '@nestjs/common';
import { EncryptionModuleOptions } from './encryption.interface';

export interface EncryptionAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (
    ...args: any[]
  ) => Promise<EncryptionModuleOptions> | EncryptionModuleOptions;
  inject?: any[];
  providers?: Provider[];
}
