import { Controller, Get, HttpStatus, Query, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ExportCsvService } from '../services/export-csv.service';
import { AkcLogger, ReqContext, RequestContext } from '../../../shared';
import { ExportCsvParamDto } from '../dtos/export-csv-param.dto';
import { StorageHelper } from '../../../shared/helpers/storage.helper';

@ApiTags('export-csv')
@Controller('export-csv')
export class ExportCsvController {
  constructor(
    private readonly exportCsvService: ExportCsvService,
    private readonly logger: AkcLogger,
  ) {
    this.logger.setContext(ExportCsvController.name);
  }

  @Get('execute')
  @ApiOperation({ summary: 'Get csv transaction execute' })
  @ApiResponse({ status: HttpStatus.OK, schema: {} })
  async exportTransactionDataToCSV(
    @ReqContext() ctx: RequestContext,
    @Query() query: ExportCsvParamDto,
    @Res() res,
  ): Promise<any> {
    this.logger.log(ctx, `${this.exportTransactionDataToCSV.name} was called!`);
    const { data, fileName } =
      await this.exportCsvService.exportTransactionDataToCSV(ctx, query);
    return await StorageHelper.getFileStream(fileName, data, 'binary')
      .then((file) => {
        res.set({
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${fileName}"`,
        });
        file.pipe(res);
      })
      .finally(() => StorageHelper.deleteFile(fileName));
  }
}
