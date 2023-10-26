import {
  InjectQueue,
  OnQueueActive,
  OnQueueCompleted,
  OnQueueError,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job, Queue } from 'bull';

import { HttpService } from '@nestjs/axios';
import { In, Repository } from 'typeorm';
import { lastValueFrom, timeout, retry } from 'rxjs';
import {
  INDEXER_API_V2,
  PAGE_REQUEST,
  QUEUES,
  SOULBOUND_PICKED_TOKEN,
  SOULBOUND_TOKEN_STATUS,
  SYNC_POINT_TYPE,
  SoulboundToken,
} from '../../../shared';
import { ServiceUtil } from '../../../shared/utils/service.util';
import { ConfigService } from '@nestjs/config';
import { SoulboundTokenRepository } from '../../../components/soulbound-token/repositories/soulbound-token.repository';
import { CronExpression } from '@nestjs/schedule';
import { SyncPointRepository } from '../../sync-point/repositories/sync-point.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { SyncPoint } from 'src/shared/entities/sync-point.entity';

@Processor(QUEUES.CW4973.QUEUE_NAME)
export class CW4973Processor {
  private readonly logger = new Logger(CW4973Processor.name);
  private indexerChainId;
  private chainDB;

  constructor(
    private serviceUtil: ServiceUtil,
    private configService: ConfigService,
    private httpService: HttpService,
    private soulboundTokenRepos: SoulboundTokenRepository,
    private syncPointRepos: SyncPointRepository,
    @InjectQueue(QUEUES.CW4973.QUEUE_NAME) private readonly cw4973Queue: Queue,
  ) {
    this.logger.log(
      '============== Constructor CW4973Processor Service ==============',
    );
    this.indexerChainId = this.configService.get('indexer.chainId');

    this.cw4973Queue.add(
      QUEUES.CW4973.JOBS.SYNC_4973_STATUS,
      {},
      {
        repeat: { cron: CronExpression.EVERY_10_SECONDS },
      },
    );

    this.chainDB = configService.get('indexerV2.chainDB');
  }

  @Process(QUEUES.CW4973.JOBS.SYNC_4973_STATUS)
  async handleJobSyncCw4973Status() {
    let currentCw4973Height = await this.syncPointRepos.findOne({
      where: {
        type: SYNC_POINT_TYPE.CW4973_BLOCK_HEIGHT,
      },
    });

    if (!currentCw4973Height) {
      currentCw4973Height = new SyncPoint();
      currentCw4973Height.type = SYNC_POINT_TYPE.CW4973_BLOCK_HEIGHT;
      currentCw4973Height.point = 0;
    }

    const graphQlQuery = {
      query: INDEXER_API_V2.GRAPH_QL.CW4973_STATUS,
      variables: {
        heightGT: currentCw4973Height.point,
        limit: PAGE_REQUEST.MAX,
      },
      operationName: INDEXER_API_V2.OPERATION_NAME.CW4973_STATUS,
    };

    const dataCw4973Statuses = (
      await this.serviceUtil.fetchDataFromGraphQL(graphQlQuery)
    )?.data[this.chainDB].cw721_activity;

    if (dataCw4973Statuses?.length > 0) {
      dataCw4973Statuses.forEach(async (dataCw4973Status) => {
        let message = dataCw4973Status.tx.data.tx.body.messages[0].msg;

        if (typeof message === 'string') {
          message = JSON.parse(message);
        }
        const takeMessage = message?.take?.signature ? message : null;
        const unequipMessage = message?.unequip?.token_id ? message : null;
        const contractAddress =
          dataCw4973Status.cw721_contract.smart_contract.address;
        const receiverAddress = dataCw4973Status.sender;

        const dataToHandle = {
          takeMessage,
          unequipMessage,
          contractAddress,
          receiverAddress,
        };

        await this.handleSyncCw4973NftStatus(dataToHandle);
      });

      currentCw4973Height.point = dataCw4973Statuses.slice(-1)[0].height;
      await this.syncPointRepos.save(currentCw4973Height);
    }
  }
  async handleSyncCw4973NftStatus(cw9473Data: {
    takeMessage: any;
    unequipMessage: any;
    contractAddress: string;
    receiverAddress: string;
  }) {
    this.logger.log(
      `============== handleSyncCw4973NftStatus was run! ==============`,
    );
    try {
      const takeContracts: any = cw9473Data.takeMessage;
      const unequipContracts: any = cw9473Data.unequipMessage;
      const takes = takeContracts?.take?.signature.signature;
      const unequips = unequipContracts?.unequip?.token_id;
      const contractAddress = cw9473Data.contractAddress;
      const tokenUri = takeContracts?.take?.uri;
      const receiverAddress = cw9473Data.receiverAddress;

      if (takeContracts) {
        const tokenId = this.serviceUtil.createTokenId(
          this.indexerChainId,
          receiverAddress,
          takeContracts?.take?.from,
          tokenUri,
        );

        const newSBTToken = await this.soulboundTokenRepos.findOne({
          where: { contract_address: contractAddress, token_id: tokenId },
        });

        if (!newSBTToken) {
          const entity = new SoulboundToken();
          const ipfs = await lastValueFrom(
            this.httpService
              .get(this.serviceUtil.transform(tokenUri))
              .pipe(timeout(8000), retry(5)),
          )
            .then((rs) => rs.data)
            .catch(() => {
              return null;
            });

          let contentType;
          const imgUrl = !!ipfs?.animation_url
            ? ipfs?.animation_url
            : ipfs?.image;
          if (imgUrl) {
            contentType = await lastValueFrom(
              this.httpService
                .get(this.serviceUtil.transform(imgUrl))
                .pipe(timeout(18000), retry(5)),
            )
              .then((rs) => rs?.headers['content-type'])
              .catch(() => {
                return null;
              });
          }

          entity.contract_address = contractAddress;
          entity.receiver_address = receiverAddress;
          entity.token_uri = tokenUri;
          entity.signature = takeContracts?.take?.signature.signature;
          entity.pub_key = takeContracts?.take?.signature.pub_key;
          entity.token_img = ipfs?.image;
          entity.token_name = ipfs?.name;
          entity.img_type = contentType;
          entity.animation_url = ipfs?.animation_url;
          entity.token_id = tokenId;
          try {
            await this.soulboundTokenRepos.insert(entity);
          } catch (err) {
            this.logger.error(`sync-cw4973-nft-status has error: ${err.stack}`);
          }
        }
      }

      const soulboundTokens = await this.soulboundTokenRepos.find({
        where: [
          { signature: takes, contract_address: contractAddress },
          { token_id: unequips, contract_address: contractAddress },
        ],
      });
      if (soulboundTokens) {
        const receiverAddress = soulboundTokens.map((m) => m.receiver_address);
        const soulboundTokenInfos = await this.soulboundTokenRepos.find({
          where: {
            receiver_address: In(receiverAddress),
          },
        });
        soulboundTokens.forEach((item) => {
          let token;
          if (item.signature === takeContracts?.take?.signature.signature) {
            token = takeContracts;
          }

          if (item.token_id === unequipContracts?.unequip?.token_id) {
            token = unequipContracts;
          }

          if (token?.take) {
            const numOfTokens = soulboundTokenInfos?.filter(
              (f) =>
                f.receiver_address === item.receiver_address &&
                (f.status === SOULBOUND_TOKEN_STATUS.EQUIPPED ||
                  f.status === SOULBOUND_TOKEN_STATUS.UNEQUIPPED),
            );
            if (
              numOfTokens?.length < SOULBOUND_PICKED_TOKEN.MAX &&
              item.status === SOULBOUND_TOKEN_STATUS.UNCLAIM
            ) {
              item.picked = true;
            }
            item.status = SOULBOUND_TOKEN_STATUS.EQUIPPED;
          } else {
            item.status = SOULBOUND_TOKEN_STATUS.UNEQUIPPED;
            item.picked = false;
          }
        });
        this.soulboundTokenRepos.save(soulboundTokens);
      }
      this.logger.log(
        `sync-cw4973-nft-status update complete: ${JSON.stringify(
          soulboundTokens,
        )}`,
      );
    } catch (err) {
      this.logger.error(`sync-cw4973-nft-status has error: ${err.stack}`);
    }
  }

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.log(`Processing job ${job.id} of type ${job.name}...`);
  }

  @OnQueueCompleted()
  async onComplete(job: Job) {
    this.logger.log(`Completed job ${job.id} of type ${job.name}`);
  }

  @OnQueueError()
  onError(job: Job, error: Error) {
    this.logger.error(`Job: ${job}`);
    this.logger.error(`Error job ${job.id} of type ${job.name}`);
    this.logger.error(`Error: ${error}`);
  }

  @OnQueueFailed()
  async onFailed(job: Job, error: Error) {
    this.logger.error(`Failed job ${job.id} of type ${job.name}`);
    this.logger.error(`Error: ${error}`);
  }
}
