import {
  Controller,
  Get,
  HttpStatus,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ExportCsvService } from '../services/export-csv.service';
import {
  AkcLogger,
  ReqContext,
  RequestContext,
  USER_ROLE,
} from '../../../shared';
import { ExportCsvParamDto } from '../dtos/export-csv-param.dto';
import { StorageHelper } from '../../../shared/helpers/storage.helper';
import { Roles } from '../../../auth/role/roles.decorator';
import { JwtAuthGuard } from '../../../auth/jwt/jwt-auth.guard';
import { RoleGuard } from '../../../auth/role/roles.guard';
import { Response } from 'express';

@ApiTags('export-csv')
@Controller('export-csv')
export class ExportCsvController {
  constructor(
    private readonly exportCsvService: ExportCsvService,
    private readonly logger: AkcLogger,
  ) {
    this.logger.setContext(ExportCsvController.name);
  }

  @Get()
  @ApiOperation({ summary: 'Get csv transaction execute' })
  @ApiResponse({ status: HttpStatus.OK, schema: {} })
  async exportCSV(
    @ReqContext() ctx: RequestContext,
    @Query() query: ExportCsvParamDto,
    @Res() res: Response,
  ): Promise<any> {
    this.logger.log(ctx, `${this.exportCSV.name} was called!`);
    const { data, fileName } =
      await this.exportCsvService.exportTransactionDataToCSV(ctx, query);

    await StorageHelper.getFileBuffer(fileName, data, 'utf-8')
      .then((file) => {
        res.set({
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${fileName}"`,
        });
        res.send(file);
      })
      .finally(() => StorageHelper.deleteFile(fileName));
  }

  @Get('private-name-tag')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(USER_ROLE.ADMIN, USER_ROLE.USER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get csv transaction execute' })
  @ApiResponse({ status: HttpStatus.OK, schema: {} })
  async exportCSVPrivate(
    @ReqContext() ctx: RequestContext,
    @Query() query: ExportCsvParamDto,
    @Res() res,
  ): Promise<any> {
    this.logger.log(ctx, `${this.exportCSVPrivate.name} was called!`);
    const { data, fileName } =
      await this.exportCsvService.exportTransactionDataToCSV(ctx, query);
    return await StorageHelper.getFileStream(fileName, data, 'binary')
      .then((file) => {
        res.set({
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${fileName}"`,
        });
        file.pipe(res);
      })
      .finally(() => StorageHelper.deleteFile(fileName));
  }
}
