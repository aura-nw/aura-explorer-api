import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ExplorerService } from './explorer.service';
import { CreateExplorerDto } from './dto/create-explorer.dto';
import { UpdateExplorerDto } from './dto/update-explorer.dto';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ReqContext, RequestContext, USER_ROLE } from 'src/shared';
import { ExplorerParamsDto } from './dto/explorer-params.dto';
import { Roles } from 'src/auth/role/roles.decorator';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { RoleGuard } from 'src/auth/role/roles.guard';
import { Explorer } from 'src/shared/entities/explorer.entity';

@ApiTags('explorer')
@Controller('explorer')
export class ExplorerController {
  constructor(private readonly explorerService: ExplorerService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(USER_ROLE.ADMIN)
  @ApiOperation({ summary: 'Create Explorer for a chain' })
  @HttpCode(HttpStatus.OK)
  create(@Body() createExplorerDto: CreateExplorerDto) {
    return this.explorerService.create(createExplorerDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(USER_ROLE.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get list Explorers' })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: Explorer, isArray: true })
  findAll(
    @ReqContext() ctx: RequestContext,
    @Query() param: ExplorerParamsDto,
  ) {
    return this.explorerService.getExplorers(ctx, param);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(USER_ROLE.ADMIN)
  findOne(@Param('id') id: string) {
    return this.explorerService.findOne(+id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(USER_ROLE.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateExplorerDto: UpdateExplorerDto,
  ) {
    return this.explorerService.update(+id, updateExplorerDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(USER_ROLE.ADMIN)
  remove(@Param('id') id: string) {
    return this.explorerService.remove(+id);
  }
}
