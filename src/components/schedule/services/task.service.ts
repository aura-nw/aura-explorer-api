import { HttpService } from '@nestjs/axios';
import { Catch, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Interval } from '@nestjs/schedule';
import { bech32 } from 'bech32';
import { sha256 } from 'js-sha256';
import { InjectSchedule, Schedule } from 'nest-schedule';
import { find, lastValueFrom } from 'rxjs';
import { BlockSyncError } from '../../../shared/entities/block-sync-error.entity';
import { ProposalDeposit } from '../../../shared/entities/proposal-deposit.entity';
import { tmhash } from 'tendermint/lib/hash';
import { v4 as uuidv4 } from 'uuid';
import { ProposalVoteRepository } from '../../../components/proposal/repositories/proposal-vote.repository';
import { AkcLogger, Block, CONST_CHAR, CONST_DELEGATE_TYPE, CONST_MSG_TYPE, CONST_NUM, CONST_PROPOSAL_TYPE, CONST_PUBKEY_ADDR, Delegation, LINK_API, SyncStatus, Transaction } from '../../../shared';
import { HistoryProposal } from '../../../shared/entities/history-proposal.entity';
import { MissedBlock } from '../../../shared/entities/missed-block.entity';
import { ProposalVote } from '../../../shared/entities/proposal-vote.entity';
import { Validator } from '../../../shared/entities/validator.entity';
import { HistoryProposalRepository } from '../../proposal/repositories/history-proposal.reponsitory';
import { BlockSyncErrorRepository } from '../repositories/block-sync-error.repository';
import { BlockRepository } from '../repositories/block.repository';
import { DelegationRepository } from '../repositories/delegation.repository';
import { MissedBlockRepository } from '../repositories/missed-block.repository';
import { SyncStatusRepository } from '../repositories/syns-status.repository';
import { TransactionRepository } from '../repositories/transaction.repository';
import { ValidatorRepository } from '../repositories/validator.repository';
import { InfluxDBClient } from './influxdb-client';
import { ProposalDepositRepository } from '../../../components/proposal/repositories/proposal-deposit.repository';
import { DelegatorReward } from '../../../shared/entities/delegator-reward.entity';
import { DelegatorRewardRepository } from '../repositories/delegator-reward.repository';



@Injectable()
export class TaskService {
  isSyncing = false;
  isSyncValidator = false;
  isSyncMissBlock = false;
  currentBlock: number;
  threads = 0;
  influxDbClient: InfluxDBClient;
  schedulesSync: Array<number> = [];
  denom = '';

  constructor(
    private readonly logger: AkcLogger,
    private httpService: HttpService,
    private configService: ConfigService,
    private statusRepository: SyncStatusRepository,
    private blockRepository: BlockRepository,
    private txRepository: TransactionRepository,
    private validatorRepository: ValidatorRepository,
    private delegationRepository: DelegationRepository,
    private proposalVoteRepository: ProposalVoteRepository,
    private historyProposalRepository: HistoryProposalRepository,
    private missedBlockRepository: MissedBlockRepository,
    private blockSyncErrorRepository: BlockSyncErrorRepository,
    private proposalDepositRepository: ProposalDepositRepository,
    private delegatorRewardRepository: DelegatorRewardRepository,
    @InjectSchedule() private readonly schedule: Schedule
  ) {
    this.logger.setContext(TaskService.name);
    this.getCurrentStatus();

    this.influxDbClient = new InfluxDBClient(
      this.configService.get<string>('influxdb.bucket'),
      this.configService.get<string>('influxdb.org'),
      this.configService.get<string>('influxdb.url'),
      this.configService.get<string>('influxdb.token'),
    );
    this.denom = this.configService.get<string>('denom');

    // Get number thread from config
    this.threads = Number(this.configService.get<string>('influxdb.threads') || 15);

    // Call worker to process
    // this.workerProcess();
  }

  async getCurrentStatus() {
    const status = await this.statusRepository.find();
    if (!status[0]) {
      const newStatus = new SyncStatus();
      newStatus.current_block = this.configService.get<number>('startHeight');
      await this.statusRepository.save(newStatus);
      this.currentBlock = this.configService.get<number>('startHeight');
    } else {
      this.currentBlock = status[0].current_block;
    }
  }
  async updateStatus(newHeight) {
    const status = await this.statusRepository.find();
    status[0].current_block = newHeight;
    await this.statusRepository.save(status[0]);
  }

  async getDataAPI(api, params) {
    const data = await lastValueFrom(this.httpService.get(api + params)).then(
      (rs) => rs.data,
    );

    return data;
  }
  async getDataRPC(rpc, params) {
    const data = await lastValueFrom(this.httpService.get(rpc + params)).then(
      (rs) => rs.data,
    );

    if (typeof data.error != CONST_CHAR.UNDEFINED) {
      throw new InternalServerErrorException();
    }
    if (typeof data.result != CONST_CHAR.UNDEFINED) {
      return data.result;
    } else {
      return '';
    }
  }
  async postDataRPC(rpc, payload) {
    const data = await lastValueFrom(this.httpService.post(rpc, payload)).then(
      (rs) => rs.data,
    );

    if (typeof data.error != CONST_CHAR.UNDEFINED) {
      throw new InternalServerErrorException();
    }
    if (typeof data.result != CONST_CHAR.UNDEFINED) {
      return data.result;
    } else {
      return '';
    }
  }

  getAddressFromPubkey(pubkey) {
    var bytes = Buffer.from(pubkey, 'base64');
    return tmhash(bytes).slice(0, 20).toString('hex').toUpperCase();
  }

  hexToBech32(address, prefix) {
    let addressBuffer = Buffer.from(address, 'hex');
    return bech32.encode(prefix, bech32.toWords(addressBuffer));
  }

  async syncUpdateValidator(newValidator, validatorData) {
    let isSave = false;

    if (validatorData.title !== newValidator.title) {
      validatorData.title = newValidator.title;
      isSave = true;
    }

    if (validatorData.jailed !== newValidator.jailed) {
      validatorData.jailed = newValidator.jailed;
      isSave = true;
    }

    if (validatorData.commission !== newValidator.commission) {
      validatorData.commission = newValidator.commission;
      isSave = true;
    }

    if (validatorData.power !== Number(newValidator.power)) {
      validatorData.power = newValidator.power;
      isSave = true;
    }

    if (validatorData.percent_power !== newValidator.percent_power) {
      validatorData.percent_power = newValidator.percent_power;
      isSave = true;
    }

    if (validatorData.self_bonded !== Number(newValidator.self_bonded)) {
      validatorData.self_bonded = newValidator.self_bonded;
      isSave = true;
    }

    if (validatorData.percent_self_bonded !== newValidator.percent_self_bonded) {
      validatorData.percent_self_bonded = newValidator.percent_self_bonded;
      isSave = true;
    }

    if (validatorData.website !== newValidator.website) {
      validatorData.website = newValidator.website;
      isSave = true;
    }

    if (validatorData.details !== newValidator.details) {
      validatorData.details = newValidator.details;
      isSave = true;
    }

    if (validatorData.identity !== newValidator.identity) {
      validatorData.identity = newValidator.identity;
      isSave = true;
    }

    if (validatorData.unbonding_height !== newValidator.unbonding_height) {
      validatorData.unbonding_height = newValidator.unbonding_height;
      isSave = true;
    }

    if (validatorData.up_time !== newValidator.up_time) {
      validatorData.up_time = newValidator.up_time;
      isSave = true;
    }

    if (validatorData.status !== newValidator.status) {
      validatorData.status = newValidator.status;
      isSave = true;
    }

    if (isSave) {
      newValidator.id = validatorData.id;
      this.validatorRepository.save(validatorData);
    }
  }

  async syncDataWithTransactions(txData) {
    try {
      const code = txData.tx_response.code;
      if (code === 0 && txData.tx.body.messages && txData.tx.body.messages.length > 0) {
        for (let i = 0; i < txData.tx.body.messages.length; i++) {
          const message: any = txData.tx.body.messages[i];
          //check type to sync data
          const txTypeReturn = message['@type'];
          const txType = txTypeReturn.substring(txTypeReturn.lastIndexOf('.') + 1);
          if (txType === CONST_MSG_TYPE.MSG_VOTE) {
            const proposalId = Number(message.proposal_id);
            const voter = message.voter;
            const option = message.option;
            //check exist in db
            let findVote = await this.proposalVoteRepository.findOne({
              where: { proposal_id: proposalId, voter: voter }
            });
            if (findVote) {
              findVote.option = option;
              findVote.updated_at = new Date(txData.tx_response.timestamp);
              findVote.tx_hash = txData.tx_response.txhash;
              await this.proposalVoteRepository.save(findVote);
            } else {
              let proposalVote = new ProposalVote();
              proposalVote.proposal_id = proposalId;
              proposalVote.voter = voter;
              proposalVote.tx_hash = txData.tx_response.txhash;
              proposalVote.option = option;
              proposalVote.created_at = new Date(txData.tx_response.timestamp);
              proposalVote.updated_at = new Date(txData.tx_response.timestamp);
              await this.proposalVoteRepository.save(proposalVote);
            }
          } else if (txType === CONST_MSG_TYPE.MSG_SUBMIT_PROPOSAL) {
            let historyProposal = new HistoryProposal();
            const proposalTypeReturn = message.content['@type'];
            const proposalType = proposalTypeReturn.substring(proposalTypeReturn.lastIndexOf('.') + 1);
            historyProposal.proposal_id = 0;
            if (txData.tx_response.logs && txData.tx_response.logs.length > 0
              && txData.tx_response.logs[0].events && txData.tx_response.logs[0].events.length > 0) {
              const events = txData.tx_response.logs[0].events;
              const submitEvent = events.find(i => i.type === 'submit_proposal');
              const attributes = submitEvent.attributes;
              const findId = attributes.find(i => i.key === 'proposal_id');
              historyProposal.proposal_id = Number(findId.value);
            }
            historyProposal.recipient = '';
            historyProposal.amount = 0;
            historyProposal.initial_deposit = 0;
            if (proposalType === CONST_PROPOSAL_TYPE.COMMUNITY_POOL_SPEND_PROPOSAL) {
              historyProposal.recipient = message.content.recipient;
              historyProposal.amount = Number(message.content.amount[0].amount);
            } else {
              if (message.initial_deposit.length > 0) {
                historyProposal.initial_deposit = Number(message.initial_deposit[0].amount);
                //save data to proposal deposit
                let proposalDeposit = new ProposalDeposit();
                proposalDeposit.proposal_id = historyProposal.proposal_id;
                proposalDeposit.tx_hash = txData.tx_response.txhash;
                proposalDeposit.depositor = message.proposer;
                proposalDeposit.amount = Number(message.initial_deposit[0].amount);
                await this.proposalDepositRepository.save(proposalDeposit);
              }
            }
            historyProposal.tx_hash = txData.tx_response.txhash;
            historyProposal.title = message.content.title;
            historyProposal.description = message.content.description;
            historyProposal.proposer = message.proposer;
            historyProposal.created_at = new Date(txData.tx_response.timestamp);
            await this.historyProposalRepository.save(historyProposal);
          } else if (txType === CONST_MSG_TYPE.MSG_DEPOSIT) {
            let proposalDeposit = new ProposalDeposit();
            proposalDeposit.proposal_id = Number(message.proposal_id);
            proposalDeposit.tx_hash = txData.tx_response.txhash;
            proposalDeposit.depositor = message.depositor;
            proposalDeposit.amount = Number(message.amount[0].amount);
            proposalDeposit.created_at = new Date(txData.tx_response.timestamp);
            await this.proposalDepositRepository.save(proposalDeposit);
          } else if (txType === CONST_MSG_TYPE.MSG_DELEGATE) {
            let delegation = new Delegation();
            delegation.tx_hash = txData.tx_response.txhash;
            delegation.delegator_address = message.delegator_address;
            delegation.validator_address = message.validator_address;
            delegation.amount = Number(message.amount.amount)/CONST_NUM.PRECISION_DIV;
            delegation.created_at = new Date(txData.tx_response.timestamp);
            delegation.type = CONST_DELEGATE_TYPE.DELEGATE;
            // TODO: Write delegation to influxdb
            this.influxDbClient.writeDelegation(
              delegation.delegator_address,
              delegation.validator_address,
              '',
              delegation.amount,
              delegation.tx_hash,
              delegation.created_at,
              delegation.type
            );
            await this.delegationRepository.save(delegation);
            //save data to delegator_rewards table
            let reward = new DelegatorReward();
            reward.delegator_address = message.delegator_address;
            reward.validator_address = message.validator_address;
            reward.amount = 0;
            if (txData.tx_response.logs && txData.tx_response.logs.length > 0
              && txData.tx_response.logs[0].events && txData.tx_response.logs[0].events.length > 0) {
              const events = txData.tx_response.logs[0].events;
              const claimEvent = events.find(i => i.type === 'transfer');
              if(claimEvent) {
                const attributes = claimEvent.attributes;
                reward.amount = Number(attributes[2].value.replace(this.denom, ''));
              }
            }
            reward.tx_hash = txData.tx_response.txhash;
            await this.delegatorRewardRepository.save(reward);
          } else if (txType === CONST_MSG_TYPE.MSG_UNDELEGATE) {
            let delegation = new Delegation();
            delegation.tx_hash = txData.tx_response.txhash;
            delegation.delegator_address = message.delegator_address;
            delegation.validator_address = message.validator_address;
            delegation.amount = (Number(message.amount.amount)*(-1))/CONST_NUM.PRECISION_DIV;
            delegation.created_at = new Date(txData.tx_response.timestamp);
            delegation.type = CONST_DELEGATE_TYPE.UNDELEGATE;
            // TODO: Write delegation to influxdb
            this.influxDbClient.writeDelegation(
              delegation.delegator_address,
              delegation.validator_address,
              '',
              delegation.amount,
              delegation.tx_hash,
              delegation.created_at,
              delegation.type
            );
            await this.delegationRepository.save(delegation);
            //save data to delegator_rewards table
            let reward = new DelegatorReward();
            reward.delegator_address = message.delegator_address;
            reward.validator_address = message.validator_address;
            reward.amount = 0;
            if (txData.tx_response.logs && txData.tx_response.logs.length > 0
              && txData.tx_response.logs[0].events && txData.tx_response.logs[0].events.length > 0) {
              const events = txData.tx_response.logs[0].events;
              const claimEvent = events.find(i => i.type === 'transfer');
              if(claimEvent) {
                const attributes = claimEvent.attributes;
                reward.amount = Number(attributes[2].value.replace(this.denom, ''));
              }
            }
            reward.tx_hash = txData.tx_response.txhash;
            await this.delegatorRewardRepository.save(reward);
          } else if (txType === CONST_MSG_TYPE.MSG_REDELEGATE) {
            let delegation1 = new Delegation();
            delegation1.tx_hash = txData.tx_response.txhash;
            delegation1.delegator_address = message.delegator_address;
            delegation1.validator_address = message.validator_src_address;
            delegation1.amount = (Number(message.amount.amount)*(-1))/CONST_NUM.PRECISION_DIV;
            delegation1.created_at = new Date(txData.tx_response.timestamp);
            delegation1.type = CONST_DELEGATE_TYPE.REDELEGATE;
            // TODO: Write delegation to influxdb
            this.influxDbClient.writeDelegation(
              delegation1.delegator_address,
              delegation1.validator_address,
              '',
              delegation1.amount,
              delegation1.tx_hash,
              delegation1.created_at,
              delegation1.type
            );
            let delegation2 = new Delegation();
            delegation2.tx_hash = txData.tx_response.txhash;
            delegation2.delegator_address = message.delegator_address;
            delegation2.validator_address = message.validator_dst_address;
            delegation2.amount = Number(message.amount.amount)/CONST_NUM.PRECISION_DIV;
            delegation2.created_at = new Date(txData.tx_response.timestamp);
            delegation2.type = CONST_DELEGATE_TYPE.REDELEGATE;
            // TODO: Write delegation to influxdb
            this.influxDbClient.writeDelegation(
              delegation2.delegator_address,
              delegation2.validator_address,
              '',
              delegation2.amount,
              delegation2.tx_hash,
              delegation2.created_at,
              delegation2.type
            );
            await this.delegationRepository.save(delegation1);
            await this.delegationRepository.save(delegation2);
            //save data to delegator_rewards table
            let amount1 = 0;
            let amount2 = 0;
            if (txData.tx_response.logs && txData.tx_response.logs.length > 0
              && txData.tx_response.logs[0].events && txData.tx_response.logs[0].events.length > 0) {
              const events = txData.tx_response.logs[0].events;
              const claimEvent = events.find(i => i.type === 'transfer');
              if(claimEvent) {
                const attributes = claimEvent.attributes;
                amount1 = Number(attributes[2].value.replace(this.denom, ''));
                amount2 = Number(attributes[5].value.replace(this.denom, ''));
              }
            }
            let reward1 = new DelegatorReward();
            reward1.delegator_address = message.delegator_address;
            reward1.validator_address = message.validator_src_address;
            reward1.amount = amount1;
            reward1.tx_hash = txData.tx_response.txhash;
            await this.delegatorRewardRepository.save(reward1);
            let reward2 = new DelegatorReward();
            reward2.delegator_address = message.delegator_address;
            reward2.validator_address = message.validator_dst_address;
            reward2.amount = amount2;
            reward2.tx_hash = txData.tx_response.txhash;
            await this.delegatorRewardRepository.save(reward2);
          } else if (txType === CONST_MSG_TYPE.MSG_WITHDRAW_DELEGATOR_REWARD) {
            let reward = new DelegatorReward();
            reward.delegator_address = message.delegator_address;
            reward.validator_address = message.validator_address;
            reward.amount = 0;
            if (txData.tx_response.logs && txData.tx_response.logs.length > 0) {
              for (let i = 0; i < txData.tx_response.logs.length; i ++) {
                const events = txData.tx_response.logs[i].events;
                const rewardEvent = events.find(i => i.type === 'withdraw_rewards');
                const attributes = rewardEvent.attributes;
                const amount = attributes[0].value;
                const findValidator = attributes.find(i => i.value === message.validator_address);
                if (findValidator) {
                  reward.amount = Number(amount.replace(this.denom, ''));
                }
              }
            }
            reward.tx_hash = txData.tx_response.txhash;
            reward.created_at = new Date(txData.tx_response.timestamp);
            await this.delegatorRewardRepository.save(reward);
          }
        }
      }
    } catch(error) {
      this.logger.log(null, 'Sync data transaction failed');
    }
  }

  /**
   * getBlockLatest
   * @returns 
   */
  async getBlockLatest(): Promise<any> {
    try {
      this.logger.log(null, `Class ${TaskService.name}, call getBlockLatest method`);

      const api = this.configService.get<string>('node.api');
      const paramsBlockLatest = `blocks/latest`;
      const results = await this.getDataAPI(api, paramsBlockLatest);
      return results;

    } catch (error) {
      return null;
    }
  }

  /**
   * handleSyncData
   * @param syncBlock 
   */
  async handleSyncData(syncBlock: number, recallSync = false): Promise<any> {
    this.logger.log(null, `Class ${TaskService.name}, call handleSyncData method with prameters: {syncBlock: ${syncBlock}}`);
    // this.logger.log(null, `Already syncing Block: ${syncBlock}`);

    const rpc = this.configService.get<string>('node.rpc');
    const api = this.configService.get<string>('node.api');

    // TODO: init write api
    this.influxDbClient.initWriteApi();

    // get validators
    const paramsValidator = LINK_API.VALIDATOR;
    const validatorData = await this.getDataAPI(api, paramsValidator);
    const fetchingBlockHeight = syncBlock;

    try {
      // fetching block from node
      const paramsBlock = `block?height=${fetchingBlockHeight}`;
      const blockData = await this.getDataRPC(rpc, paramsBlock);

      // create block
      const newBlock = new Block();
      newBlock.block_hash = blockData.block_id.hash;
      newBlock.chainid = blockData.block.header.chain_id;
      newBlock.height = blockData.block.header.height;
      newBlock.num_txs = blockData.block.data.txs.length;
      newBlock.timestamp = blockData.block.header.time;
      newBlock.round = blockData.block.last_commit.round;

      const operatorAddress = blockData.block.header.proposer_address;
      let blockGasUsed = 0;
      let blockGasWanted = 0;

      //Insert block error table
      if (!recallSync) {
        await this.insertBlockError(newBlock.block_hash, newBlock.height);

        // Mark schedule is running
        this.schedulesSync.push(Number(newBlock.height));
      }

      // set proposer and operator_address from validators
      for (let key in validatorData.validators) {
        const ele = validatorData.validators[key];
        const pubkey = this.getAddressFromPubkey(ele.consensus_pubkey.key);
        if (pubkey === operatorAddress) {
          newBlock.proposer = ele.description.moniker;
          newBlock.operator_address = ele.operator_address;
        }
      }

      if (blockData.block.data.txs && blockData.block.data.txs.length > 0) {
        // create transaction
        for (let key in blockData.block.data.txs) {
          const element = blockData.block.data.txs[key];

          const txHash = sha256(Buffer.from(element, 'base64')).toUpperCase();
          this.logger.log(null, `processing tx: ${txHash}`);

          // fetch tx data
          const paramsTx = `cosmos/tx/v1beta1/txs/${txHash}`;

          const txData = await this.getDataAPI(api, paramsTx);

          let txType = 'FAILED';
          if (txData.tx_response.code === 0) {
            const txLog = JSON.parse(txData.tx_response.raw_log);

            const txAttr = txLog[0].events.find(
              ({ type }) => type === CONST_CHAR.MESSAGE,
            );
            const txAction = txAttr.attributes.find(
              ({ key }) => key === CONST_CHAR.ACTION,
            );
            const regex = /_/gi;
            txType = txAction.value.replace(regex, ' ');
          } else {
            const txBody = txData.tx_response.tx.body.messages[0];
            txType = txBody['@type'];
          }
          blockGasUsed += parseInt(txData.tx_response.gas_used);
          blockGasWanted += parseInt(txData.tx_response.gas_wanted);
          let savedBlock;
          if (parseInt(key) === blockData.block.data.txs.length - 1) {
            newBlock.gas_used = blockGasUsed;
            newBlock.gas_wanted = blockGasWanted;
            try {
              savedBlock = await this.blockRepository.save(newBlock);
            } catch (error) {
              savedBlock = await this.blockRepository.findOne({
                where: { block_hash: blockData.block_id.hash },
              });
            }
          }
          const newTx = new Transaction();
          const fee = txData.tx_response.tx.auth_info.fee.amount[0];
          const txFee = (fee[CONST_CHAR.AMOUNT] / CONST_NUM.PRECISION_DIV).toFixed(6);
          newTx.block = savedBlock;
          newTx.code = txData.tx_response.code;
          newTx.codespace = txData.tx_response.codespace;
          newTx.data =
            txData.tx_response.code === 0 ? txData.tx_response.data : '';
          newTx.gas_used = txData.tx_response.gas_used;
          newTx.gas_wanted = txData.tx_response.gas_wanted;
          newTx.height = fetchingBlockHeight;
          newTx.info = txData.tx_response.info;
          newTx.raw_log = txData.tx_response.raw_log;
          newTx.timestamp = blockData.block.header.time;
          newTx.tx = JSON.stringify(txData.tx_response);
          newTx.tx_hash = txData.tx_response.txhash;
          newTx.type = txType;
          newTx.fee = txFee;
          newTx.messages = txData.tx_response.tx.body.messages;
          try {
            await this.txRepository.save(newTx);
          } catch (error) {
            this.logger.error(null, `Transaction is already existed!`);
          }
          // TODO: Write tx to influxdb
          this.influxDbClient.writeTx(
            newTx.tx_hash,
            newTx.height,
            newTx.type,
            newTx.timestamp,
          );

          //sync data with transactions
          await this.syncDataWithTransactions(txData);

        }
      } else {
        try {
          await this.blockRepository.save(newBlock);
        } catch (error) {
          this.logger.error(null, `Block is already existed!`);
        }
        // TODO: Write block to influxdb
        this.influxDbClient.writeBlock(
          newBlock.height,
          newBlock.block_hash,
          newBlock.num_txs,
          newBlock.chainid,
          newBlock.timestamp,
        );
      }

      /**
       * TODO: Flush pending writes and close writeApi.
       */
      // this.influxDbClient.closeWriteApi();

      // Update current block
      let currentBlk = 0;
      const status = await this.statusRepository.findOne();
      if (status) {
        currentBlk = status.current_block;
      }

      if (syncBlock > currentBlk) {
        await this.updateStatus(fetchingBlockHeight);
      }

      // Delete data on Block sync error table
      await this.removeBlockError(syncBlock);

      const idxSync = this.schedulesSync.indexOf(fetchingBlockHeight);
      if (idxSync > (-1)) {
        this.schedulesSync.splice(idxSync, 1);
      }

    } catch (error) {
      this.logger.error(null, `${error.name}: ${error.message}`);
      this.logger.error(null, `${error.stack}`);

      const idxSync = this.schedulesSync.indexOf(fetchingBlockHeight);
      if (idxSync > (-1)) {
        this.schedulesSync.splice(idxSync, 1);
      }
    }
  }

  /**
   * scheduleTimeoutJob
   * @param height 
   */
  scheduleTimeoutJob(height: number) {
    this.logger.log(null, `Class ${TaskService.name}, call scheduleTimeoutJob method with prameters: {currentBlk: ${height}}`);

    this.schedule.scheduleTimeoutJob(`schedule_sync_block_${uuidv4()}`, 100, async () => {
      //Update code sync data
      await this.handleSyncData(height);

      // Close thread
      return true;
    });
  }

  // /**
  //  * threadProcess
  //  * @param currentBlk Current block
  //  * @param blockLatest The final block
  //  */
  // threadProcess(currentBlk: number, latestBlk: number) {
  //   let loop = 0;
  //   let height = 0;
  //   try {
  //     let blockNotSync = latestBlk - currentBlk;
  //     if (blockNotSync > 0) {
  //       if (blockNotSync > this.threads) {
  //         loop = this.threads;
  //       } else {
  //         loop = blockNotSync;
  //       }

  //       // Create 10 thread to sync data      
  //       for (let i = 1; i <= loop; i++) {
  //         height = currentBlk + i;
  //         this.scheduleTimeoutJob(height);
  //       }
  //     }
  //   } catch (error) {
  //     this.logger.log(null, `Call threadProcess method error: $${error.message}`);
  //   }

  //   // If current block not equal latest block when the symtem will call workerProcess method    
  //   this.schedule.scheduleIntervalJob(`schedule_recall_${(new Date()).getTime()}`, 1000, async () => {
  //     // Update code sync data
  //     this.logger.log(null, `Class ${TaskService.name}, recall workerProcess method`);
  //     this.workerProcess(height);

  //     // Close thread
  //     return true;
  //   });
  // }

  // /**
  //  * workerProcess
  //  * @param height
  //  */
  // async workerProcess(height: number = undefined) {

  //   this.logger.log(null, `Class ${TaskService.name}, call workerProcess method`);

  //   let currentBlk = 0;
  //   // Get blocks latest
  //   const blockLatest = await this.getBlockLatest();
  //   let latestBlk = Number(blockLatest?.block?.header?.height || 0);

  //   if (height > 0) {
  //     currentBlk = height;

  //   } else {
  //     try {
  //       //Get current height
  //       const status = await this.statusRepository.findOne();
  //       if (status) {
  //         currentBlk = status.current_block;
  //       }
  //     } catch (err) { }
  //   }

  //   this.threadProcess(currentBlk, latestBlk)
  // }

  /**
   * insertBlockError
   * @param block_hash 
   * @param height 
   */
  async insertBlockError(block_hash: string, height: number) {
    const blockSyncError = new BlockSyncError();
    blockSyncError.block_hash = block_hash;
    blockSyncError.height = height;
    await this.blockSyncErrorRepository.save(blockSyncError);
  }

  /**
   * removeBlockError
   * @param height 
   */
  async removeBlockError(height: number) {
    await this.blockSyncErrorRepository.delete({ height: height });
  }

  /**
   * blockSyncError
   */
  // @Interval(2000)
  // async blockSyncError() {
  //   const result: BlockSyncError = await this.blockSyncErrorRepository.findOne({ order: { id: 'DESC' } });
  //   if (result) {
  //     const idxSync = this.schedulesSync.indexOf(result.height);

  //     // Check height has sync or not. If height hasn't sync when we recall handleSyncData method
  //     if (idxSync < 0) {
  //       await this.handleSyncData(result.height, true);
  //       this.schedulesSync.splice(idxSync, 1);
  //     }
  //   }
  // }
}
