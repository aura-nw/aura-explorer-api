import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { NameTagService } from '../services/name-tag.service';
import {
  AkcLogger,
  BaseApiResponse,
  MESSAGES,
  ReqContext,
  RequestContext,
  USER_ROLE,
} from '../../../shared';
import { NameTagParamsDto } from '../dtos/name-tag-params.dto';
import { StoreNameTagParamsDto } from '../dtos/store-name-tag-params.dto';
import { RoleGuard } from '../../../auth/role/roles.guard';
import { Roles } from '../../../auth/role/roles.decorator';
import { JwtAuthGuard } from '../../../auth/jwt/jwt-auth.guard';
import { NameTag } from '../../../shared/entities/name-tag.entity';
import { GetNameTagDto } from '../dtos/get-name-tag.dto';
import { GethNameTagResult } from '../dtos/get-name-tag-result.dto';

@Controller('name-tag')
@ApiTags('name-tag')
@ApiUnauthorizedResponse({
  description: MESSAGES.ERROR.NOT_PERMISSION,
})
@ApiForbiddenResponse({
  description: MESSAGES.ERROR.NOT_PERMISSION,
})
@ApiBadRequestResponse({
  description: MESSAGES.ERROR.BAD_REQUEST,
})
export class NameTagController {
  constructor(
    private readonly nameTagService: NameTagService,
    private readonly logger: AkcLogger,
  ) {
    this.logger.setContext(NameTagController.name);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(USER_ROLE.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get list name tag' })
  @ApiResponse({ status: HttpStatus.OK })
  async getNameTags(
    @ReqContext() ctx: RequestContext,
    @Query() request: NameTagParamsDto,
  ): Promise<BaseApiResponse<NameTag[]>> {
    this.logger.log(ctx, `${this.getNameTags.name} was called!`);
    const { result, count } = await this.nameTagService.getNameTags(
      ctx,
      request,
    );

    return { data: result, meta: { count } };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(USER_ROLE.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get list name tag' })
  @ApiResponse({ status: HttpStatus.OK })
  async getNameTagsDetail(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: number,
  ): Promise<NameTag> {
    this.logger.log(ctx, `${this.getNameTags.name} was called!`);
    const result = await this.nameTagService.getNameTagsDetail(ctx, id);
    return result;
  }

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(USER_ROLE.ADMIN)
  @ApiBearerAuth()
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
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(USER_ROLE.ADMIN)
  @ApiBearerAuth()
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
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(USER_ROLE.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'delete name tag' })
  @ApiResponse({ status: HttpStatus.OK })
  async deleteNameTag(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: number,
  ): Promise<any> {
    this.logger.log(ctx, `${this.deleteNameTag.name} was called!`);
    return await this.nameTagService.deleteNameTag(ctx, id);
  }

  @Post('get-name-tag')
  @ApiOperation({ summary: 'get name tag by address or name' })
  @ApiOkResponse({
    description: 'return name tag by address or name.',
    type: GethNameTagResult,
  })
  @HttpCode(HttpStatus.OK)
  async getNameTag(@Body() request: GetNameTagDto): Promise<GethNameTagResult> {
    return await this.nameTagService.getNameTag(request);
  }
}
