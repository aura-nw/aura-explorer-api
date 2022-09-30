import {
  Controller,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  AkcLogger
} from '../../../shared';

import { TransactionService } from '../services/transaction.service';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionController {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly logger: AkcLogger,
  ) {
    this.logger.setContext(TransactionController.name);
  }
}
