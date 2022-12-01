import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AkcLogger, ReqContext, RequestContext } from '../../../shared';
import { TokenParasDto } from '../dtos/token-paras.dto';
import { CreateSoulboundTokenParamsDto } from '../dtos/create-soulbound-token-params.dto';
import { SoulboundContractParasDto } from '../dtos/soulbound-contract-paras.dto';
import { UpdateSoulboundTokenParamsDto } from '../dtos/update-soulbound-token-params.dto';
import { SoulboundTokenService } from '../services/soulbound-token.service';
import { PickedNftParasDto } from '../dtos/picked-nft-paras.dto';

@Controller('soulbound-token')
@ApiTags('soulbound-token')
export class SoulboundTokenController {
  constructor(
    private readonly logger: AkcLogger,
    private soulboundTokenService: SoulboundTokenService,
  ) {}

  @Get('contracts')
  @ApiOperation({ summary: 'Get list contract of Soulbound contract' })
  @ApiResponse({ status: HttpStatus.OK, schema: {} })
  async getSoulboundContracts(
    @ReqContext() ctx: RequestContext,
    @Query() query: SoulboundContractParasDto,
  ) {
    this.logger.log(
      ctx,
      `============== ${this.getSoulboundContracts.name} was called! ==============`,
    );
    const { contracts, count } = await this.soulboundTokenService.getContracts(
      ctx,
      query,
    );

    return { data: contracts, meta: count };
  }

  @Get('tokens')
  @ApiOperation({
    summary: 'Get list tokens by minter address and contract address',
  })
  @ApiResponse({ status: HttpStatus.OK, schema: {} })
  async getTokens(
    @ReqContext() ctx: RequestContext,
    @Query() req: TokenParasDto,
  ) {
    this.logger.log(
      ctx,
      `============== ${
        this.getTokens.name
      } was called with paras: ${JSON.stringify(req)}! ==============`,
    );
    const { data, count } = await this.soulboundTokenService.getTokens(
      ctx,
      req,
    );
    return { data, meta: count };
  }

  @Post()
  @ApiOperation({
    summary:
      'Create token of Soulbound contract which user can clain or mint token',
  })
  @ApiResponse({ status: HttpStatus.OK, schema: {} })
  async create(
    @ReqContext() ctx: RequestContext,
    @Body() req: CreateSoulboundTokenParamsDto,
  ) {
    this.logger.log(
      ctx,
      `============== ${this.create.name} was called! ==============`,
    );
    const result = await this.soulboundTokenService.create(ctx, req);
    return result;
  }

  @Put('picked-nft')
  @ApiOperation({ summary: 'Picked Nft of Soulbound contract' })
  @ApiResponse({ status: HttpStatus.OK, schema: {} })
  async pickedNft(
    @ReqContext() ctx: RequestContext,
    @Body() req: PickedNftParasDto,
  ) {
    this.logger.log(
      ctx,
      `============== ${this.pickedNft.name} was called! ==============`,
    );
    return await this.soulboundTokenService.pickedNft(ctx, req);
  }
}
