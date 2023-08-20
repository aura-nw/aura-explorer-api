import { DynamicModule, Global, Module, Provider, Type } from '@nestjs/common';
import { EncryptionService } from './encryption.service';
import { CipherKey } from 'src/shared/entities/cipher-key.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ENCRYPTION_CONFIG,
  ENCRYPTION_CONFIG_OPTIONS,
} from './encryption.contants';
import {
  EncryptionModuleAsyncOptions,
  EncryptionModuleFactory,
  EncryptionModuleOptions,
} from './encryption.interface';
import { createEncryptionProvider } from './encryption.provider';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([CipherKey])],
  providers: [EncryptionService],
  exports: [EncryptionService],
})
export class EncryptionModule {
  static forRootAsync(options: EncryptionModuleAsyncOptions): DynamicModule {
    const provider: Provider = {
      inject: [ENCRYPTION_CONFIG_OPTIONS],
      provide: ENCRYPTION_CONFIG,
      useFactory: async (options: EncryptionModuleOptions) => {
        return createEncryptionProvider(options);
      },
    };
    return {
      module: EncryptionModule,
      imports: options.imports,
      providers: [...this.createAsyncProviders(options), provider],
      exports: [provider],
    };
  }

  private static createAsyncProviders(
    options: EncryptionModuleAsyncOptions,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    const useClass = options.useClass as Type<EncryptionModuleFactory>;
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: useClass,
        useClass,
      },
    ];
  }
  private static createAsyncOptionsProvider(
    options: EncryptionModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: ENCRYPTION_CONFIG_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    const inject = [
      (options.useClass ||
        options.useExisting) as Type<EncryptionModuleFactory>,
    ];

    return {
      provide: ENCRYPTION_CONFIG_OPTIONS,
      useFactory: async (optionsFactory: EncryptionModuleFactory) =>
        await optionsFactory.createHttpModuleOptions(),
      inject,
    };
  }
}
