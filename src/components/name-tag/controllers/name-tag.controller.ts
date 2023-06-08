import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NameTagService } from '../services/name-tag.service';
import { AkcLogger, ReqContext, RequestContext } from '../../../shared';
import { NameTagParamsDto } from '../dtos/name-tag-params.dto';
import { StoreNameTagParamsDto } from '../dtos/store-name-tag-params.dto';

@Controller('name-tag')
@ApiTags('name-tag')
export class NameTagController {
  constructor(
    private readonly nameTagService: NameTagService,
    private readonly logger: AkcLogger,
  ) {
    this.logger.setContext(NameTagController.name);
  }

  @Get()
  @ApiOperation({ summary: 'Get list name tag' })
  @ApiResponse({ status: HttpStatus.OK })
  async getNameTags(
    @ReqContext() ctx: RequestContext,
    @Query() request: NameTagParamsDto,
  ): Promise<any> {
    this.logger.log(ctx, `${this.getNameTags.name} was called!`);
    const { result, count } = await this.nameTagService.getNameTags(
      ctx,
      request,
    );

    return { data: result, meta: { count } };
  }

  @Post()
  @ApiOperation({ summary: 'create name tag' })
  @ApiResponse({ status: HttpStatus.CREATED })
  async createNameTag(
    @ReqContext() ctx: RequestContext,
    @Body() request: StoreNameTagParamsDto,
  ): Promise<any> {
    this.logger.log(ctx, `${this.createNameTag.name} was called!`);
    return await this.nameTagService.createNameTag(ctx, request);
  }

  @Put()
  @ApiOperation({ summary: 'update name tag' })
  @ApiResponse({ status: HttpStatus.OK })
  async updateNameTag(
    @ReqContext() ctx: RequestContext,
    @Body() request: StoreNameTagParamsDto,
  ): Promise<any> {
    this.logger.log(ctx, `${this.updateNameTag.name} was called!`);
    return await this.nameTagService.updateNameTag(ctx, request);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'delete name tag' })
  @ApiResponse({ status: HttpStatus.OK })
  async deleteNameTag(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: number,
  ): Promise<any> {
    this.logger.log(ctx, `${this.deleteNameTag.name} was called!`);
    return await this.nameTagService.deleteNameTag(ctx, id);
  }
}
