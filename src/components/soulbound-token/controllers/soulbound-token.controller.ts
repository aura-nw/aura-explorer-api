import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
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
import { PickedTokenParasDto } from '../dtos/picked-token-paras.dto';
import { ReceiverTokenParasDto } from '../dtos/receive-token-paras.dto';

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

    return { data: contracts, meta: { count } };
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
    return { data, meta: { count } };
  }

  @Get('tokens-detail/:tokenId')
  @ApiOperation({
    summary: 'Get tokens details by tokenId',
  })
  @ApiResponse({ status: HttpStatus.OK, schema: {} })
  async getTokensDetail(@ReqContext() ctx, @Param('tokenId') tokenId: string) {
    this.logger.log(
      ctx,
      `============== ${
        this.getTokens.name
      } was called with paras: tokenId=${JSON.stringify(
        tokenId,
      )}! ==============`,
    );
    const data = await this.soulboundTokenService.getTokensDetail(ctx, tokenId);
    return data;
  }

  @Get('tokens-receiver-address')
  @ApiOperation({
    summary: 'Get list tokens by receiver address',
  })
  @ApiResponse({ status: HttpStatus.OK, schema: {} })
  async getTokenByReceiverAddress(
    @ReqContext() ctx: RequestContext,
    @Query() req: ReceiverTokenParasDto,
  ) {
    this.logger.log(
      ctx,
      `============== ${this.getTokenByReceiverAddress.name} was called with paras: ${req.receiverAddress}! ==============`,
    );
    const { data, count } =
      await this.soulboundTokenService.getTokenByReceiverAddress(ctx, req);
    return { data, meta: { count } };
  }

  @Get('tokens-picked')
  @ApiOperation({
    summary: 'Get picker list tokens by address',
  })
  @ApiResponse({ status: HttpStatus.OK, schema: {} })
  async getTokenPickedByAddress(
    @ReqContext() ctx: RequestContext,
    @Query() req: PickedTokenParasDto,
  ) {
    this.logger.log(
      ctx,
      `============== ${this.getTokenPickedByAddress.name} was called with paras: address:${req.receiverAddress}, limit: ${req.limit}! ==============`,
    );
    const { data, count } =
      await this.soulboundTokenService.getTokenPickedByAddress(ctx, req);
    return { data, meta: { count } };
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
    return await this.soulboundTokenService.create(ctx, req);
  }

  @Put()
  @ApiOperation({ summary: 'Update status token of Soulbound contract' })
  @ApiResponse({ status: HttpStatus.OK, schema: {} })
  async update(
    @ReqContext() ctx: RequestContext,
    @Body() req: UpdateSoulboundTokenParamsDto,
  ) {
    this.logger.log(
      ctx,
      `============== ${this.update.name} was called! ==============`,
    );
    return await this.soulboundTokenService.update(ctx, req);
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
