import { Provider } from '@nestjs/common';
import { EncryptionService } from './encryption.service';
import { EncryptionModuleOptions } from './encryption.interface';
import {
  ENCRYPTION_CONFIG,
  ENCRYPTION_CONFIG_OPTIONS,
} from './encryption.contants';

export const getEncryptionModuleOptions = (
  options: EncryptionModuleOptions,
): EncryptionService => {
  return new EncryptionService(null, options);
};

export function createEncryptionProvider(
  options: EncryptionModuleOptions,
): Provider {
  return {
    provide: ENCRYPTION_CONFIG,
    useValue: getEncryptionModuleOptions(options),
  };
}
