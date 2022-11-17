import { Controller, Get, Param, Post, Put, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ReqContext, RequestContext } from "../../../shared";
import { SoulboundTokenService } from "../services/soulbound-token.service";

@Controller('soulbound-token')
@ApiTags('soulbound-token')
export class SoulboundTokenController{

    constructor(private soulboundTokenService: SoulboundTokenService){

    }

    @Get()
    getTokens(@ReqContext() ctx: RequestContext, @Query('status') status: string){

    }

    @Post()
    create(){

    }

    @Put()
    update(){
        
    }
}
