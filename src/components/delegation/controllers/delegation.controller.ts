import {
  CacheInterceptor,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpStatus,
  Param,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LiteTransactionOutput } from '../../../components/transaction/dtos/lite-transaction-output.dto';
import { TransactionService } from '../../../components/transaction/services/transaction.service';
import {
  AkcLogger,
  BaseApiResponse,
  RequestContext,
  SwaggerBaseApiResponse,
  ReqContext,
} from '../../../shared';
import { DelegationService } from '../services/delegation.service';


@ApiTags('delegatios')
@Controller('delegatios')
export class DelegatioController {
  constructor(
    private readonly delegationService: DelegationService,
    private readonly logger: AkcLogger
  ) {
    this.logger.setContext(DelegatioController.name);
  }

  @Get(':delegatorAddr/redelegations')
  async redelegations(
    @ReqContext() ctx: RequestContext,
    @Param('delegatorAddr') delegatorAddr: string
  ){
    
  }

}
