import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SharedModule } from "../../shared";
import { WalletController } from "./controllers/wallet.controller";
import { WalletService } from "./services/wallet.service";

@Module({
    imports: [
      SharedModule,
      TypeOrmModule.forFeature([]),
      HttpModule,
      ConfigModule,
    ],
    providers: [WalletService],
    controllers: [WalletController],
    exports: [WalletService],
  })
  export class WalletModule {}