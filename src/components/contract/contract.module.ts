import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ServiceUtil } from "../../shared/utils/service.util";
import { SharedModule } from "../../shared";
import { ContractController } from "./controllers/contract.controller";
import { ContractRepository } from "./repositories/contract.repository";
import { ContractService } from "./services/contract.service";
import { ConfigModule } from "@nestjs/config";
import { TagRepository } from "./repositories/tag.repository";
import { HttpModule } from "@nestjs/axios";

@Module({
  imports: [
    SharedModule,
    TypeOrmModule.forFeature([
      ContractRepository,
      TagRepository
    ]),
    ConfigModule,
    HttpModule
  ],
  providers: [ContractService, ServiceUtil],
  controllers: [ContractController],
  exports: [ContractService],
})
export class ContractModule { }