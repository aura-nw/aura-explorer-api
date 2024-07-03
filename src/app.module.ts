import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { SharedModule } from './shared/shared.module';
import { ComponentsModule } from './components/components.module';
import { AccountModule } from './components/account/account.module';
import { ServiceUtil } from './shared/utils/service.util';
import { ContractModule } from './components/contract/contract.module';
import { Cw20TokenModule } from './components/cw20-token/cw20-token.module';
import { SoulboundTokenModule } from './components/soulbound-token/soulbound-token.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './components/mail/mail.module';
import { PasswordAuthModule } from './auth/password/password-auth.module';
import { QueuesModule } from './components/queues/queues.module';
import { PrivateNameTagModule } from './components/private-name-tag/private-name-tag.module';
import { PublicNameTagModule } from './components/public-name-tag/public-name-tag.module';
import { ExportCsvModule } from './components/export-csv/export-csv.module';
import { GoogleRecaptchaModule } from '@nestlab/google-recaptcha/google-recaptcha.module';
import { NotificationModule } from './components/notification/notification.module';
import { WatchListModule } from './components/watch-list/watch-list.module';
import { AssetModule } from './components/asset/asset.module';
import { Micro3CampaignModule } from './micro3-campaign/micro3-campaign.module';
import { ExplorerModule } from './components/explorer/explorer.module';

@Module({
  imports: [
    AuthModule,
    SharedModule,
    ComponentsModule,
    ConfigModule,
    HttpModule,
    AccountModule,
    ContractModule,
    Cw20TokenModule,
    SoulboundTokenModule,
    PrivateNameTagModule,
    NotificationModule,
    PublicNameTagModule,
    ExportCsvModule,
    MailModule,
    WatchListModule,
    AssetModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PasswordAuthModule,
    QueuesModule,
    GoogleRecaptchaModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        configService.get('googleRecaptchaOptions'),
      inject: [ConfigService],
    }),
    Micro3CampaignModule,
    ExplorerModule,
  ],
  providers: [ServiceUtil],
})
export class AppModule {}
