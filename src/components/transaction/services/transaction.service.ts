import { Injectable } from '@nestjs/common';
import { AkcLogger } from '../../../shared';
import { TransactionRepository } from '../repositories/transaction.repository';

@Injectable()
export class TransactionService {

  constructor(
    private readonly logger: AkcLogger,
    private txRepository: TransactionRepository,
  ) {
    this.logger.setContext(TransactionService.name);
  }

  async getTotalTx(): Promise<number> {
    return await this.txRepository.count();
  }
}
