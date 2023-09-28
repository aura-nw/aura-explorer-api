import { Controller, Get, HttpStatus, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ExportCsvService } from '../services/export-csv.service';
import { AkcLogger, ReqContext, RequestContext } from '../../../shared';
import { ExportCsvParamDto } from '../dtos/export-csv-param.dto';

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
  ): Promise<any> {
    this.logger.log(ctx, `${this.exportTransactionDataToCSV.name} was called!`);

    const account = await this.exportCsvService.exportTransactionDataToCSV(
      ctx,
      query,
    );

    return { data: account, meta: {} };
  }
}
