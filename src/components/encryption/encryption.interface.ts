import { PlaintextType } from 'aws-sdk/clients/kms';
import { ModuleMetadata, Type } from '@nestjs/common';

export interface EncryptionModuleOptions {
  key: PlaintextType;
}

export interface EncryptionModuleFactory {
  createHttpModuleOptions: () =>
    | Promise<EncryptionModuleOptions>
    | EncryptionModuleOptions;
}

export interface EncryptionModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  inject?: any[];
  useClass?: Type<EncryptionModuleFactory>;
  useExisting?: Type<EncryptionModuleFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<EncryptionModuleOptions> | EncryptionModuleOptions;
}
