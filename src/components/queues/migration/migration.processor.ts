import {
  InjectQueue,
  OnQueueError,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import { Logger, OnModuleInit } from '@nestjs/common';
import { Job, Queue } from 'bull';
import { LENGTH, QUEUES } from '../../../shared';
import { PrivateNameTag } from '../../../shared/entities/private-name-tag.entity';
import { PublicNameTag } from '../../../shared/entities/public-name-tag.entity';
import { WatchList } from '../../../shared/entities/watch-list.entity';
import { IsNull, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Explorer } from '../../../shared/entities/explorer.entity';
import { convertBech32AddressToEvmAddress } from 'src/shared/utils/service.util';

@Processor(QUEUES.MIGRATION.QUEUE_NAME)
export class MigrationProcessor implements OnModuleInit {
  private readonly logger = new Logger(MigrationProcessor.name);

  constructor(
    @InjectRepository(PrivateNameTag)
    private readonly privateNameTagRepo: Repository<PrivateNameTag>,
    @InjectRepository(PublicNameTag)
    private readonly publicNameTagRepo: Repository<PublicNameTag>,
    @InjectRepository(WatchList)
    private readonly watchListRepo: Repository<WatchList>,
    @InjectRepository(Explorer)
    private readonly explorerRepository: Repository<Explorer>,
    @InjectQueue(QUEUES.MIGRATION.QUEUE_NAME)
    private readonly addressQueue: Queue,
  ) {
    this.logger.log(
      '============== Constructor Address Processor Service ==============',
    );
  }

  async onModuleInit() {
    this.logger.log(
      '============== On Module Init Address Processor Service ==============',
    );

    const explorer = await this.explorerRepository.find();

    explorer.forEach((explorer, index) => {
      this.addressQueue.add(
        QUEUES.MIGRATION.JOB_MIGRATE_EVM_ADDRESS,
        { explorer },
        {
          repeat: { cron: `0 ${index} * * *` },
        },
      );
    });
  }

  @Process(QUEUES.MIGRATION.JOB_MIGRATE_EVM_ADDRESS)
  async handleMigrateEvmAddress(job: Job) {
    this.logger.log(
      `============== handleMigrateEvmAddress was run! ==============`,
    );
    const explorer = job.data.explorer;
    await Promise.all([
      this.storeData(this.privateNameTagRepo, explorer),
      this.storeData(this.publicNameTagRepo, explorer),
      this.storeData(this.watchListRepo, explorer),
    ]);
  }

  private async storeData(
    repos: Repository<any>,
    explorer: Explorer,
  ): Promise<void> {
    const data = await repos.find({
      where: { evmAddress: IsNull(), explorer: { id: explorer?.id } },
    });

    const result = data.map((item) => {
      // Remove prefix address
      const addressNoPrefix = item.address?.replace(explorer.addressPrefix, '');
      if (addressNoPrefix.length !== LENGTH.CONTRACT_ADDRESS_NO_PREFIX) {
        item.evmAddress = convertBech32AddressToEvmAddress(
          explorer.addressPrefix,
          item.address,
        );
      }
      return item;
    });

    // Update name tag with evm address
    await repos.save(result);
  }

  @OnQueueError()
  onError(job: Job, error: Error) {
    this.logger.error(`Error job ${job.id} of type ${job.name}`);
    this.logger.error(`Error: ${error}`);
  }

  @OnQueueFailed()
  async onFailed(job: Job, error: Error) {
    this.logger.error(`Failed job ${job.id} of type ${job.name}`);
    this.logger.error(`Error: ${error}`);
  }
}
