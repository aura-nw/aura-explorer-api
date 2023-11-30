import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ChainInfoService } from './chain-info.service';
import { CreateChainInfoDto } from './dto/create-chain-info.dto';
import { UpdateChainInfoDto } from './dto/update-chain-info.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from '../../auth/role/roles.decorator';
import { RoleGuard } from '../../auth/role/roles.guard';
import { MESSAGES, SwaggerBaseApiResponse, USER_ROLE } from '../../shared';
import { JwtAuthGuard } from '../../auth/jwt/jwt-auth.guard';
import { ChainInfoResponseDto } from './dto/chain-info-response.dto';
import { ChainInfo } from '../../shared/entities/chain-info.entity';

@ApiUnauthorizedResponse({
  description: MESSAGES.ERROR.NOT_PERMISSION,
})
@ApiForbiddenResponse({
  description: MESSAGES.ERROR.NOT_PERMISSION,
})
@ApiBadRequestResponse({
  description: MESSAGES.ERROR.BAD_REQUEST,
})
@ApiTags('chain-info')
@Controller()
export class ChainInfoController {
  constructor(private readonly chainInfoService: ChainInfoService) {}

  @Post('admin/chain-info')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(USER_ROLE.ADMIN)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    type: ChainInfoResponseDto,
  })
  async create(@Body() createChainInfoDto: CreateChainInfoDto) {
    return this.chainInfoService.create(createChainInfoDto);
  }

  @Get('chain-info')
  @ApiOkResponse({
    type: SwaggerBaseApiResponse(ChainInfoResponseDto),
  })
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<{ data: ChainInfo[]; meta: { count: number } }> {
    return await this.chainInfoService.findAll();
  }

  @Get('chain-info/:id')
  @ApiOkResponse({
    type: ChainInfoResponseDto,
  })
  async findOne(@Param('id') id: string): Promise<ChainInfo> {
    return this.chainInfoService.findOne(+id);
  }

  @Put('admin/chain-info/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(USER_ROLE.ADMIN)
  @ApiBearerAuth()
  @ApiOkResponse({
    type: ChainInfoResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() updateChainInfoDto: UpdateChainInfoDto,
  ): Promise<ChainInfo> {
    return this.chainInfoService.update(+id, updateChainInfoDto);
  }

  @Delete('admin/chain-info/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(USER_ROLE.ADMIN)
  @ApiBearerAuth()
  @ApiNoContentResponse({
    description: 'Delete successfully.',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.chainInfoService.remove(+id);
  }
}
