import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
  UseGuards,
  HttpStatus,
  HttpCode,
  Query,
} from '@nestjs/common';
import { WatchListService } from '../watch-list.service';
import { CreateWatchListDto } from '../dto/create-watch-list.dto';
import { UpdateWatchListDto } from '../dto/update-watch-list.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  BaseApiResponse,
  MESSAGES,
  ReqContext,
  RequestContext,
  SwaggerBaseApiResponse,
  USER_ROLE,
} from '../../../shared';
import { JwtAuthGuard } from '../../../auth/jwt/jwt-auth.guard';
import { RoleGuard } from '../../../auth/role/roles.guard';
import { Roles } from '../../../auth/role/roles.decorator';
import { WatchList } from '../../../shared/entities/watch-list.entity';
import { WatchListDetailResponse } from '../dto/watch-list-detail.response';

@ApiTags('watch-list')
@ApiUnauthorizedResponse({
  description: MESSAGES.ERROR.NOT_PERMISSION,
})
@ApiForbiddenResponse({
  description: MESSAGES.ERROR.NOT_PERMISSION,
})
@ApiBadRequestResponse({
  description: MESSAGES.ERROR.BAD_REQUEST,
})
@ApiBearerAuth()
@UsePipes(new ValidationPipe({ whitelist: true }))
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles(USER_ROLE.ADMIN, USER_ROLE.USER)
@Controller('watch-list')
export class WatchListController {
  constructor(private readonly watchListService: WatchListService) {}

  @Get()
  @ApiOkResponse({
    description: 'Return all watch list.',
    type: SwaggerBaseApiResponse(WatchListDetailResponse),
  })
  @ApiQuery({
    name: 'keyword',
    description: 'Search by address, public/ private name  tag.',
    required: false,
  })
  async findAll(
    @ReqContext() ctx: RequestContext,
    @Query('keyword') keyword?: string,
  ): Promise<BaseApiResponse<WatchListDetailResponse[]>> {
    return await this.watchListService.findAll(ctx, keyword);
  }

  @Post()
  @ApiCreatedResponse({
    description: 'Create watch list successfully.',
    type: WatchListDetailResponse,
  })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @ReqContext() ctx: RequestContext,
    @Body() createWatchListDto: CreateWatchListDto,
  ): Promise<WatchListDetailResponse> {
    return await this.watchListService.create(ctx, createWatchListDto);
  }

  @Get(':id')
  @ApiOkResponse({
    description: 'Return a watch list.',
    type: WatchListDetailResponse,
  })
  async findOne(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: string,
  ): Promise<WatchList> {
    return await this.watchListService.findOne(ctx, +id);
  }

  @Patch(':id')
  @ApiOkResponse({
    description: 'Return a watch list.',
    type: WatchListDetailResponse,
  })
  async update(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: string,
    @Body() updateWatchListDto: UpdateWatchListDto,
  ): Promise<WatchListDetailResponse> {
    return await this.watchListService.update(ctx, +id, updateWatchListDto);
  }

  @Delete(':id')
  @ApiNoContentResponse({
    description: 'Delete a watch list successfully.',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: string,
  ): Promise<void> {
    await this.watchListService.remove(ctx, +id);
  }
}
