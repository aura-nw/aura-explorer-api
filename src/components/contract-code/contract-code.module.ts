import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ServiceUtil } from "../../shared/utils/service.util";
import { SharedModule } from "../../shared";
import { ContractCodeController } from "./controllers/contract-code.controller";
import { ContractCodeRepository } from "./repositories/contract-code.repository";
import { ContractCodeService } from "./services/contract-code.service";
import { HttpModule } from "@nestjs/axios";

@Module({
    imports: [
      SharedModule,
      TypeOrmModule.forFeature([
        ContractCodeRepository
      ]),
      ConfigModule,
      HttpModule
    ],
    providers: [ContractCodeService, ServiceUtil],
    controllers: [ContractCodeController],
    exports: [ContractCodeService],
  })
  export class ContractCodeModule { }