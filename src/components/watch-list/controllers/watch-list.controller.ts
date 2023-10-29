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
} from '@nestjs/common';
import { WatchListService } from '../watch-list.service';
import { CreateWatchListDto } from '../dto/create-watch-list.dto';
import { UpdateWatchListDto } from '../dto/update-watch-list.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { MESSAGES, ReqContext, RequestContext, USER_ROLE } from 'src/shared';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { RoleGuard } from 'src/auth/role/roles.guard';
import { Roles } from 'src/auth/role/roles.decorator';

@ApiTags('watch-list')
@UsePipes(new ValidationPipe({ whitelist: true }))
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
  async findAll(@ReqContext() ctx: RequestContext) {
    return await this.watchListService.findAll(ctx);
  }

  @Post()
  async create(
    @ReqContext() ctx: RequestContext,
    @Body() createWatchListDto: CreateWatchListDto,
  ) {
    return await this.watchListService.create(ctx, createWatchListDto);
  }

  @Get(':id')
  async findOne(@ReqContext() ctx: RequestContext, @Param('id') id: string) {
    return await this.watchListService.findOne(ctx, +id);
  }

  @Patch(':id')
  async update(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: string,
    @Body() updateWatchListDto: UpdateWatchListDto,
  ) {
    return await this.watchListService.update(ctx, +id, updateWatchListDto);
  }

  @Delete(':id')
  async remove(@ReqContext() ctx: RequestContext, @Param('id') id: string) {
    return await this.watchListService.remove(ctx, +id);
  }
}
