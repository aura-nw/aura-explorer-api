import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
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
import { PrivateNameTagService } from '../services/private-name-tag.service';
import {
  AkcLogger,
  BaseApiResponse,
  MESSAGES,
  ReqContext,
  RequestContext,
  USER_ROLE,
} from '../../../shared';
import { PrivateNameTagParamsDto } from '../dtos/private-name-tag-params.dto';
import { CreatePrivateNameTagParamsDto } from '../dtos/create-private-name-tag-params.dto';
import { RoleGuard } from '../../../auth/role/roles.guard';
import { Roles } from '../../../auth/role/roles.decorator';
import { JwtAuthGuard } from '../../../auth/jwt/jwt-auth.guard';
import { PrivateNameTag } from '../../../shared/entities/private-name-tag.entity';
import { GetPrivateNameTagAdminResult } from '../dtos/get-private-name-tag-admin.dto';
import { UpdatePrivateNameTagParamsDto } from '../dtos/update-private-name-tag-params.dto';

@Controller()
@ApiTags('private-name-tag')
@ApiUnauthorizedResponse({
  description: MESSAGES.ERROR.NOT_PERMISSION,
})
@ApiForbiddenResponse({
  description: MESSAGES.ERROR.NOT_PERMISSION,
})
@ApiBadRequestResponse({
  description: MESSAGES.ERROR.BAD_REQUEST,
})
export class PrivateNameTagController {
  constructor(
    private readonly nameTagService: PrivateNameTagService,
    private readonly logger: AkcLogger,
  ) {
    this.logger.setContext(PrivateNameTagController.name);
  }

  @Get('user/private-name-tag')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(USER_ROLE.ADMIN, USER_ROLE.USER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get list private name tag' })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: GetPrivateNameTagAdminResult })
  async getNameTags(
    @ReqContext() ctx: RequestContext,
    @Query() request: PrivateNameTagParamsDto,
  ): Promise<BaseApiResponse<GetPrivateNameTagAdminResult[]>> {
    this.logger.log(ctx, `${this.getNameTags.name} was called!`);
    const { data, count, countFavorite } =
      await this.nameTagService.getNameTags(ctx, request);
    return { data, meta: { count, countFavorite } };
  }

  @Get('user/private-name-tag/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(USER_ROLE.ADMIN, USER_ROLE.USER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get private name tag by Id' })
  @ApiResponse({ status: HttpStatus.OK })
  async getNameTagsDetail(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: number,
  ): Promise<PrivateNameTag> {
    this.logger.log(ctx, `${this.getNameTags.name} was called!`);
    const result = await this.nameTagService.getNameTagsDetail(ctx, id);
    return result;
  }

  @Post('user/private-name-tag')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(USER_ROLE.ADMIN, USER_ROLE.USER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create private name tag' })
  @ApiResponse({ status: HttpStatus.CREATED })
  async createNameTag(
    @ReqContext() ctx: RequestContext,
    @Body() request: CreatePrivateNameTagParamsDto,
  ): Promise<any> {
    this.logger.log(ctx, `${this.createNameTag.name} was called!`);
    return await this.nameTagService.createNameTag(ctx, request);
  }

  @Patch('user/private-name-tag/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(USER_ROLE.ADMIN, USER_ROLE.USER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update Private name tag' })
  @ApiResponse({ status: HttpStatus.OK })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async updateNameTag(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: number,
    @Body() request: UpdatePrivateNameTagParamsDto,
  ): Promise<any> {
    this.logger.log(ctx, `${this.updateNameTag.name} was called!`);
    return await this.nameTagService.updateNameTag(ctx, id, request);
  }

  @Delete('user/private-name-tag/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(USER_ROLE.ADMIN, USER_ROLE.USER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete Private name tag' })
  @ApiResponse({ status: HttpStatus.OK })
  async deleteNameTag(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: number,
  ): Promise<any> {
    this.logger.log(ctx, `${this.deleteNameTag.name} was called!`);
    return await this.nameTagService.deleteNameTag(ctx, id);
  }
}
