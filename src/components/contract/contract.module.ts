import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SharedModule } from "../../shared";
import { ContractController } from "./controllers/contract.controller";
import { ContractRepository } from "./repositories/contract.repository";
import { ContractService } from "./services/contract.service";

@Module({
  imports: [
    SharedModule,
    TypeOrmModule.forFeature([
      ContractRepository
    ])
  ],
  providers: [ContractService],
  controllers: [ContractController],
  exports: [ContractService],
})
export class ContractModule { }