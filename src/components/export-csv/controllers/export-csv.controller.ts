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
import { Roles } from '../../../auth/role/roles.decorator';
import { JwtAuthGuard } from '../../../auth/jwt/jwt-auth.guard';
import { RoleGuard } from '../../../auth/role/roles.guard';
import { Response } from 'express';
import { Parser } from '@json2csv/plainjs';
import { Recaptcha } from '@nestlab/google-recaptcha';

@ApiTags('export-csv')
@Recaptcha()
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
  ): Promise<void> {
    this.logger.log(ctx, `${this.exportCSV.name} was called!`);
    this.processCSV(ctx, query, res);
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
  ): Promise<void> {
    this.logger.log(ctx, `${this.exportCSVPrivate.name} was called!`);
    const userId = ctx.user?.id;
    this.processCSV(ctx, query, res, userId);
  }

  private async processCSV(ctx, query, res, userId = null) {
    try {
      const { data, fileName, fields } =
        await this.exportCsvService.exportTransactionDataToCSV(
          ctx,
          query,
          userId,
        );

      const csvParser = new Parser({
        fields,
      });
      const csv = csvParser.parse(data?.length > 0 ? data : {});

      res.set({
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      });
      res.send(csv);
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: { message: 'Something went wrong!' } });
    }
  }
}
