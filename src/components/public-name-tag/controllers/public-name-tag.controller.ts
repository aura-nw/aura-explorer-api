import {
  Body,
  CacheInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PublicNameTagService } from '../services/public-name-tag.service';
import {
  AkcLogger,
  BaseApiResponse,
  MESSAGES,
  ReqContext,
  RequestContext,
  USER_ROLE,
} from '../../../shared';
import { PublicNameTagParamsDto } from '../dtos/public-name-tag-params.dto';
import { StorePublicNameTagParamsDto } from '../dtos/store-public-name-tag-params.dto';
import { RoleGuard } from '../../../auth/role/roles.guard';
import { Roles } from '../../../auth/role/roles.decorator';
import { JwtAuthGuard } from '../../../auth/jwt/jwt-auth.guard';
import { PublicNameTag } from '../../../shared/entities/public-name-tag.entity';
import { GetPublicNameTagResult } from '../dtos/get-public-name-tag-result.dto';
import { GetPublicNameTagAdminResult } from '../dtos/get-public-name-tag-admin.dto';
import { UpdatePublicNameTagParamsDto } from '../dtos/update-public-name-tag-params.dto';

@Controller()
@ApiTags('public-name-tag')
@ApiUnauthorizedResponse({
  description: MESSAGES.ERROR.NOT_PERMISSION,
})
@ApiForbiddenResponse({
  description: MESSAGES.ERROR.NOT_PERMISSION,
})
@ApiBadRequestResponse({
  description: MESSAGES.ERROR.BAD_REQUEST,
})
export class PublicNameTagController {
  constructor(
    private readonly nameTagService: PublicNameTagService,
    private readonly logger: AkcLogger,
  ) {
    this.logger.setContext(PublicNameTagController.name);
  }

  @Get('admin/public-name-tag')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(USER_ROLE.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get list name tag' })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: GetPublicNameTagAdminResult })
  async getNameTags(
    @ReqContext() ctx: RequestContext,
    @Query() request: PublicNameTagParamsDto,
  ): Promise<BaseApiResponse<PublicNameTag[]>> {
    this.logger.log(ctx, `${this.getNameTags.name} was called!`);
    const { result, count } = await this.nameTagService.getPublicNameTags(
      ctx,
      request,
    );

    return { data: result, meta: { count } };
  }

  @Get('admin/public-name-tag/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(USER_ROLE.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get public name tag by id.' })
  @ApiResponse({ status: HttpStatus.OK })
  async getNameTagsDetail(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: number,
  ): Promise<PublicNameTag> {
    this.logger.log(ctx, `${this.getNameTags.name} was called!`);
    const result = await this.nameTagService.getPublicNameTagsDetail(ctx, id);
    return result;
  }

  @Post('admin/public-name-tag')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(USER_ROLE.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create name tag' })
  @ApiResponse({ status: HttpStatus.CREATED })
  async createPublicNameTag(
    @ReqContext() ctx: RequestContext,
    @Req() req,
    @Body() request: StorePublicNameTagParamsDto,
  ): Promise<any> {
    this.logger.log(ctx, `${this.createPublicNameTag.name} was called!`);
    return await this.nameTagService.createPublicNameTag(
      ctx,
      req.user.id,
      request,
    );
  }

  @Put('admin/public-name-tag')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(USER_ROLE.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update name tag' })
  @ApiResponse({ status: HttpStatus.OK })
  async updateNameTag(
    @ReqContext() ctx: RequestContext,
    @Req() req,
    @Body() request: UpdatePublicNameTagParamsDto,
  ): Promise<any> {
    this.logger.log(ctx, `${this.updateNameTag.name} was called!`);
    return await this.nameTagService.updatePublicNameTag(
      ctx,
      req.user.id,
      request,
    );
  }

  @Delete('admin/public-name-tag/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(USER_ROLE.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete name tag' })
  @ApiResponse({ status: HttpStatus.OK })
  async deleteNameTag(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: number,
  ): Promise<any> {
    this.logger.log(ctx, `${this.deleteNameTag.name} was called!`);
    return await this.nameTagService.deletePublicNameTag(ctx, id);
  }

  @UseInterceptors(CacheInterceptor)
  @Get('public-name-tag')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all public name tag.' })
  @ApiOkResponse({
    description: 'Get all public name tag.',
    type: GetPublicNameTagResult,
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Number of public name tag per page. Max is 500.',
  })
  @ApiQuery({
    name: 'nextKey',
    type: Number,
    required: false,
    description: 'Key for next page.',
  })
  async getNameTag(
    @Query('limit') limit?: number,
    @Query('nextKey') nextKey?: number,
  ): Promise<GetPublicNameTagResult> {
    return await this.nameTagService.getNameTagMainSite({ limit, nextKey });
  }
}
