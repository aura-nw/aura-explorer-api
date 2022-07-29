import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ServiceUtil } from "../../shared/utils/service.util";
import { SharedModule } from "../../shared";
import { Cw20TokenController } from "./controllers/cw20-token.controller";
import { Cw20TokenService } from "./services/cw20-token.service";

@Module({
    imports: [
      SharedModule,
      TypeOrmModule.forFeature([
      ]),
      ConfigModule,
      HttpModule
    ],
    providers: [Cw20TokenService, ServiceUtil],
    controllers: [Cw20TokenController],
    exports: [Cw20TokenService],
  })
  export class Cw20TokenModule { }