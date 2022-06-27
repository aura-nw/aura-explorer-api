import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SharedModule } from "../../shared";
import { ContractCodeController } from "./controllers/contract-code.controller";
import { ContractCodeRepository } from "./repositories/contract-code.repository";
import { ContractCodeService } from "./services/contract-code.service";

@Module({
    imports: [
      SharedModule,
      TypeOrmModule.forFeature([
        ContractCodeRepository
      ]),
      ConfigModule
    ],
    providers: [ContractCodeService],
    controllers: [ContractCodeController],
    exports: [ContractCodeService],
  })
  export class ContractCodeModule { }