import { DynamicModule, Module } from '@nestjs/common';
import { EncryptionService } from './encryption.service';
import { EncryptionAsyncOptions, ENCRYPTION_CONFIG_OPTIONS } from './encryption-options.type';
import { CipherKey } from 'src/shared/entities/cipher-key.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([CipherKey])],
    providers: [EncryptionService],
    exports: [EncryptionService, ENCRYPTION_CONFIG_OPTIONS],
})
export class EncryptionModule {
    static registerAsync(options: EncryptionAsyncOptions): DynamicModule {
        return {
            module: EncryptionModule,
            imports: options.imports,
            providers: [{
                provide: ENCRYPTION_CONFIG_OPTIONS,
                useFactory: options.useFactory,
                inject: options.inject,
            },
                EncryptionService
            ],
            exports: [EncryptionService],
        };
    }
}