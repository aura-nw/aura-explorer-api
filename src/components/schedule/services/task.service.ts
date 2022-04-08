import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Interval } from '@nestjs/schedule';
import { lastValueFrom } from 'rxjs';
import { sha256 } from 'js-sha256';
import { InjectSchedule, Schedule } from 'nest-schedule';
import { v4 as uuidv4 } from 'uuid';

import { AkcLogger, Block, Transaction, SyncStatus, LINK_API, Delegation, CONST_CHAR, RequestContext, CONST_MSG_TYPE, CONST_PUBKEY_ADDR } from '../../../shared';

import { BlockRepository } from '../repositories/block.repository';
import { SyncStatusRepository } from '../repositories/syns-status.repository';
import { TransactionRepository } from '../repositories/transaction.repository';
import { InfluxDBClient } from './influxdb-client';
import { tmhash } from 'tendermint/lib/hash';
import { bech32 } from 'bech32';
import { Validator } from '../../../shared/entities/validator.entity';
import { ValidatorRepository } from '../repositories/validator.repository';
import { DelegationRepository } from '../repositories/delegation.repository';
import { ProposalVote } from '../../../shared/entities/proposal-vote.entity';
import { MissedBlock } from '../../../shared/entities/missed-block.entity';
import { MissedBlockRepository } from '../repositories/missed-block.repository';
import { ProposalVoteRepository } from '../../../components/proposal/repositories/proposal-vote.repository';
import { HistoryProposal } from '../../../shared/entities/history-proposal';
import { HistoryProposalRepository } from '../../proposal/repositories/history-proposal.reponsitory';
import { BlockSyncErrorRepository } from '../repositories/block-sync-error.repository';
import { BlockSyncError } from 'src/shared/entities/block-sync-error.entity';

@Injectable()
export class TaskService {
  isSyncing: boolean;
  isSyncValidator: boolean;
  currentBlock: number;
  threads = 0;
  influxDbClient: InfluxDBClient;

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
    @InjectSchedule() private readonly schedule: Schedule
  ) {
    this.logger.setContext(TaskService.name);
    this.isSyncing = false;
    this.isSyncValidator = false;
    this.getCurrentStatus();

    this.influxDbClient = new InfluxDBClient(
      this.configService.get<string>('influxdb.bucket'),
      this.configService.get<string>('influxdb.org'),
      this.configService.get<string>('influxdb.url'),
      this.configService.get<string>('influxdb.token'),
    );

    // Get number thread from config
    this.threads = Number(this.configService.get<string>('influxdb.threads')) || 15;

    // Call worker to process
    this.workerProcess();
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

  // @Interval(500)
  async handleInterval() {
    // check status
    if (this.isSyncing) {
      this.logger.log(null, 'already syncing... wait');
      return;
    } else {
      this.logger.log(null, 'fetching data...');
    }

    const rpc = this.configService.get<string>('node.rpc');
    const api = this.configService.get<string>('node.api');

    // get latest block height
    const payloadStatus = {
      jsonrpc: '2.0',
      id: 1,
      method: 'status',
      params: [],
    };
    const status = await this.postDataRPC(rpc, payloadStatus);
    const latestHeight = status
      ? Number(status.sync_info.latest_block_height)
      : 0;

    // get current synced block
    await this.getCurrentStatus();

    // TODO: init write api
    this.influxDbClient.initWriteApi();

    // get validators
    const paramsValidator = LINK_API.VALIDATOR;
    const validatorData = await this.getDataAPI(api, paramsValidator);

    if (latestHeight > this.currentBlock) {
      this.isSyncing = true;
      const fetchingBlockHeight = this.currentBlock + 1;

      this.logger.log(null, `processing block: ${fetchingBlockHeight}`);

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
            const paramsTx = `/cosmos/tx/v1beta1/txs/${txHash}`

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
            const txFee = (fee[CONST_CHAR.AMOUNT] / 1000000).toFixed(6);
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
            //sync data proposal-votes
            // await this.syncDataProposalVotes(txData);
            // await this.syncHistoryProposal(txData);
            // TODO: Write tx to influxdb
            this.influxDbClient.writeTx(
              newTx.tx_hash,
              newTx.height,
              newTx.type,
              newTx.timestamp,
            );
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

        // update current block
        await this.updateStatus(fetchingBlockHeight);
        this.isSyncing = false;
      } catch (error) {
        this.isSyncing = false;
        this.logger.error(null, `${error.name}: ${error.message}`);
        this.logger.error(null, `${error.stack}`);
      }
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

  @Interval(500)
  async syncValidator() {
    // check status
    if (this.isSyncing) {
      this.logger.log(null, 'already syncing validator... wait');
      return;
    } else {
      this.logger.log(null, 'fetching data validator...');
    }

    const api = this.configService.get<string>('node.api');

    // get validators
    const paramsValidator = LINK_API.VALIDATOR;
    const validatorData = await this.getDataAPI(api, paramsValidator);

    // get staking pool
    const paramspool = LINK_API.STAKING_POOL;
    const poolData = await this.getDataAPI(api, paramspool);

    // get slashing param
    const paramsSlashing = LINK_API.SLASHING_PARAM;
    const slashingData = await this.getDataAPI(api, paramsSlashing);

    // get slashing signing info
    const paramsSigning = LINK_API.SIGNING_INFOS;
    const signingData = await this.getDataAPI(api, paramsSigning);

    if (validatorData) {
      this.isSyncValidator = true;
      for (let key in validatorData.validators) {
        const data = validatorData.validators[key];

        // get slashing signing info
        const paramDelegation = `/cosmos/staking/v1beta1/validators/${data.operator_address}/delegations`;
        const delegationData = await this.getDataAPI(api, paramDelegation);

        try {
          // create validator
          const newValidator = new Validator();
          newValidator.operator_address = data.operator_address;
          const operator_address = data.operator_address;
          const decodeAcc = bech32.decode(operator_address, 1023);
          const wordsByte = bech32.fromWords(decodeAcc.words);
          newValidator.acc_address = bech32.encode(CONST_PUBKEY_ADDR.AURA, bech32.toWords(wordsByte));
          newValidator.cons_address = this.getAddressFromPubkey(data.consensus_pubkey.key);
          newValidator.cons_pub_key = data.consensus_pubkey.key;
          newValidator.title = data.description.moniker;
          newValidator.jailed = data.jailed;
          newValidator.commission = Number(data.commission.commission_rates.rate).toFixed(2);
          newValidator.max_commission = data.commission.commission_rates.max_rate;
          newValidator.max_change_rate = data.commission.commission_rates.max_change_rate;
          newValidator.min_self_delegation = data.min_self_delegation;
          newValidator.delegator_shares = data.delegator_shares;
          newValidator.power = data.tokens;
          newValidator.website = data.description.website;
          newValidator.details = data.description.details;
          newValidator.identity = data.description.identity;
          newValidator.unbonding_height = data.unbonding_height;
          newValidator.unbonding_time = data.unbonding_time;
          newValidator.update_time = data.commission.update_time;
          const percentPower = (data.tokens / poolData.pool.bonded_tokens) * 100;
          newValidator.percent_power = percentPower.toFixed(2);
          const pubkey = this.getAddressFromPubkey(data.consensus_pubkey.key);
          const address = this.hexToBech32(pubkey, CONST_PUBKEY_ADDR.AURAVALCONS);
          const signingInfo = signingData.info.filter(e => e.address === address);
          if (signingInfo.length > 0) {
            const signedBlocksWindow = slashingData.params.signed_blocks_window;
            const missedBlocksCounter = signingInfo[0].missed_blocks_counter;
            newValidator.up_time = (signedBlocksWindow - missedBlocksCounter) / signedBlocksWindow * 100 + CONST_CHAR.PERCENT;
          }
          const selfBonded = delegationData.delegation_responses.filter(e => e.delegation.delegator_address === newValidator.acc_address);
          if (selfBonded.length > 0) {
            newValidator.self_bonded = selfBonded[0].balance.amount;
            const percentSelfBonded = (selfBonded[0].balance.amount / data.tokens) * 100;
            newValidator.percent_self_bonded = percentSelfBonded.toFixed(2) + CONST_CHAR.PERCENT;
          }

          // insert into table validator
          try {
            await this.validatorRepository.save(newValidator);
          } catch (error) {
            this.logger.error(null, `Validator is already existed!`);
          }
          // TODO: Write validator to influxdb
          this.influxDbClient.writeValidator(
            newValidator.operator_address,
            newValidator.title,
            newValidator.jailed,
            newValidator.power,
          );

          const validators = await this.validatorRepository.find();
          const validatorFilter = validators.filter(e => e.operator_address === data.operator_address);
          if (validatorFilter) {
            this.syncUpdateValidator(newValidator, validatorFilter[0]);
          }

          for (let key in delegationData.delegation_responses) {
            const dataDel = delegationData.delegation_responses[key];
            // create delegator by validator address
            const newDelegator = new Delegation();
            newDelegator.delegator_address = dataDel.delegation.delegator_address;
            newDelegator.validator_address = dataDel.delegation.validator_address;
            newDelegator.shares = dataDel.delegation.shares;
            const amount = parseInt((dataDel.balance.amount / 1000000).toFixed(5));
            newDelegator.amount = amount;
            // insert into table delegation
            try {
              await this.delegationRepository.save(newDelegator);
            } catch (error) {
              this.logger.error(null, `Delegation is already existed!`);
            }
            // TODO: Write delegator to influxdb
            this.influxDbClient.writeDelegation(
              newDelegator.delegator_address,
              newDelegator.validator_address,
              newDelegator.shares,
              newDelegator.amount,
            );

          }
          this.isSyncValidator = false;
        } catch (error) {
          this.isSyncValidator = false;
          this.logger.error(null, `${error.name}: ${error.message}`);
          this.logger.error(null, `${error.stack}`);
        }
      }
    }
  }

  async syncUpdateValidator(newValidator, validatorData) {
    if (newValidator.jailed) {
      newValidator.jailed = '1';
    } else {
      newValidator.jailed = '0';
    }
    if (validatorData.title !== newValidator.title) {
      validatorData.title = newValidator.title;
      this.validatorRepository.save(validatorData);
    }
    if (validatorData.jailed !== newValidator.jailed) {
      validatorData.jailed = newValidator.jailed;
      this.validatorRepository.save(validatorData);
    }
    if (validatorData.commission !== newValidator.commission) {
      validatorData.commission = newValidator.commission;
      this.validatorRepository.save(validatorData);
    }
    if (validatorData.power !== parseInt(newValidator.power)) {
      validatorData.power = newValidator.power;
      this.validatorRepository.save(validatorData);
    }
    if (validatorData.percent_power !== newValidator.percent_power) {
      validatorData.percent_power = newValidator.percent_power;
      this.validatorRepository.save(validatorData);
    }
    if (validatorData.self_bonded !== parseInt(newValidator.self_bonded)) {
      validatorData.self_bonded = newValidator.self_bonded;
      this.validatorRepository.save(validatorData);
    }
    if (validatorData.percent_self_bonded !== newValidator.percent_self_bonded) {
      validatorData.percent_self_bonded = newValidator.percent_self_bonded;
      this.validatorRepository.save(validatorData);
    }
    if (validatorData.website !== newValidator.website) {
      validatorData.website = newValidator.website;
      this.validatorRepository.save(validatorData);
    }
    if (validatorData.details !== newValidator.details) {
      validatorData.details = newValidator.details;
      this.validatorRepository.save(validatorData);
    }
    if (validatorData.identity !== newValidator.identity) {
      validatorData.identity = newValidator.identity;
      this.validatorRepository.save(validatorData);
    }
    if (validatorData.unbonding_height !== newValidator.unbonding_height) {
      validatorData.unbonding_height = newValidator.unbonding_height;
      this.validatorRepository.save(validatorData);
    }
    if (validatorData.up_time !== newValidator.up_time) {
      validatorData.up_time = newValidator.up_time;
      this.validatorRepository.save(validatorData);
    }
  }

  async syncDataProposalVotes(txData) {
    if (txData.tx.body.messages && txData.tx.body.messages.length > 0) {
      for (let i = 0; i < txData.tx.body.messages.length; i++) {
        const message: any = txData.tx.body.messages[i];
        //check type to sync data
        const type = message['@type'];
        if (type != '' && type.substring(type.lastIndexOf('.') + 1) === CONST_MSG_TYPE.MSG_VOTE) {
          let proposalVote = new ProposalVote();
          proposalVote.proposal_id = message.proposal_id;
          proposalVote.voter = message.voter;
          proposalVote.tx_hash = txData.tx_response.txhash;
          proposalVote.option = message.option;
          proposalVote.created_at = txData.tx_response.timestamp;
          try {
            await this.proposalVoteRepository.save(proposalVote);
          } catch (error) {
            this.logger.error(null, `Proposal vote is already existed!`);
          }
        }
      }
    }
  }

  async syncHistoryProposal(txData) {
    if (txData.tx.body.messages && txData.tx.body.messages.length > 0) {
      for (let i = 0; i < txData.tx.body.messages.length; i++) {
        const message: any = txData.tx.body.messages[i];
        //check type to sync data
        const type = message['@type'];
        if (type != '' && type.substring(type.lastIndexOf('.') + 1) === CONST_MSG_TYPE.MSG_HISTORY_PROPOSAL) {
          let proposalHistory = new HistoryProposal();
          proposalHistory.id = message.id;
          proposalHistory.tx_hash = txData.tx_response.txhash;
          proposalHistory.title = message.title;
          proposalHistory.description = message.description;
          proposalHistory.recipient = message.recipient;
          proposalHistory.amount = message.amount;
          proposalHistory.amount = message.amount;
          proposalHistory.initial_deposit = message.initial_deposit;
          proposalHistory.proposer = message.proposer;
          proposalHistory.created_at = txData.tx_response.timestamp;
          try {
            await this.historyProposalRepository.save(proposalHistory);
          } catch (error) {
            this.logger.error(null, `History proposal is already existed!`);
          }
        }
      }
    }
  }

  @Interval(500)
  async syncMissedBlock() {
    // check status
    if (this.isSyncing) {
      this.logger.log(null, 'already syncing validator... wait');
      return;
    } else {
      this.logger.log(null, 'fetching data validator...');
    }

    const api = this.configService.get<string>('node.api');

    // get blocks latest
    const paramsBlockLatest = `/blocks/latest`;
    const blockLatestData = await this.getDataAPI(api, paramsBlockLatest);

    if (blockLatestData) {
      const heightLatest = blockLatestData.block.header.height;
      // get block by height
      const paramsBlock = `/blocks/${heightLatest}`;
      const blockData = await this.getDataAPI(api, paramsBlock);

      // get validatorsets
      const paramsValidatorsets = `/cosmos/base/tendermint/v1beta1/validatorsets/${heightLatest}`;
      const validatorsetsData = await this.getDataAPI(api, paramsValidatorsets);

      if (validatorsetsData) {
        for (let key in validatorsetsData.validators) {
          const data = validatorsetsData.validators[key];
          const address = this.getAddressFromPubkey(data.pub_key.key);

          if (blockData) {
            const signingInfo = blockData.block.last_commit.signatures.filter(e => e.validator_address === address);
            if (signingInfo.length <= 0) {
              try {
                // create missed block
                const newMissedBlock = new MissedBlock();
                newMissedBlock.height = blockData.block.header.height;
                newMissedBlock.validator_address = address;
                newMissedBlock.timestamp = blockData.block.header.time;

                // insert into table missed-block
                try {
                  await this.missedBlockRepository.save(newMissedBlock);
                } catch (error) {
                  this.logger.error(null, `Missed is already existed!`);
                }
                // TODO: Write missed block to influxdb
                this.influxDbClient.writeMissedBlock(
                  newMissedBlock.validator_address,
                  newMissedBlock.height,
                );
              } catch (error) {
                this.logger.error(null, `${error.name}: ${error.message}`);
                this.logger.error(null, `${error.stack}`);
              }
            }
          }
        }
      }
    }
  }

  /**
   * getBlockLatest
   * @returns 
   */
  async getBlockLatest(): Promise<any> {
    this.logger.log(null, `Class ${TaskService.name}, call getBlockLatest method`);

    const api = this.configService.get<string>('node.api');
    const paramsBlockLatest = `/blocks/latest`;
    const results = await this.getDataAPI(api, paramsBlockLatest);
    return results;
  }

  /**
   * handleSyncData
   * @param syncBlock 
   */
  async handleSyncData(syncBlock: number): Promise<any> {
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
      await this.insertBlockError(newBlock.block_hash, newBlock.height);

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
          const paramsTx = `/cosmos/tx/v1beta1/txs/${txHash}`

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
          const txFee = (fee[CONST_CHAR.AMOUNT] / 1000000).toFixed(6);
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
          //sync data proposal-votes
          // await this.syncDataProposalVotes(txData);
          // TODO: Write tx to influxdb
          this.influxDbClient.writeTx(
            newTx.tx_hash,
            newTx.height,
            newTx.type,
            newTx.timestamp,
          );
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

    } catch (error) {
      this.logger.error(null, `${error.name}: ${error.message}`);
      this.logger.error(null, `${error.stack}`);
    }
  }

  /**
   * scheduleTimeoutJob
   * @param height 
   */
  scheduleTimeoutJob(height: number) {
    this.logger.log(null, `Class ${TaskService.name}, call scheduleTimeoutJob method with prameters: {currentBlk: ${height}}`);

    this.schedule.scheduleTimeoutJob(`schedule_sync_block_${uuidv4()}`, 10, async () => {
      try {
        //Update code sync data
        await this.handleSyncData(height);

        // Close thread
        return true;

      } catch (error) {
        this.logger.error(null, `${error.name}: ${error.message}`);
        this.logger.error(null, `${error.stack}`);

        // If error thread will restart and run util complete
        return false;
      }
    });
  }

  /**
   * threadProcess
   * @param currentBlk Current block
   * @param blockLatest The final block
   */
  threadProcess(currentBlk: number, latestBlk: number) {
    let loop = 0;
    let blockNotSync = latestBlk - currentBlk;
    if (blockNotSync > this.threads) {
      loop = this.threads;
    } else {
      loop = blockNotSync;
    }

    // Create 10 thread to sync data
    let height = 0;
    for (let i = 1; i <= loop; i++) {
      height = currentBlk + i;
      this.scheduleTimeoutJob(height);
    }

    // If current block not equal latest block when the symtem will call workerProcess method    
    this.schedule.scheduleIntervalJob(`schedule_recall_${(new Date()).getTime()}`, 1000, async () => {
      // Update code sync data
      this.logger.log(null, `Class ${TaskService.name}, recall workerProcess method`);
      this.workerProcess(height);

      // Close thread
      return true;
    });
  }

  /**
   * workerProcess
   * @param height
   */
  async workerProcess(height: number = undefined) {

    this.logger.log(null, `Class ${TaskService.name}, call workerProcess method`);

    let currentBlk = 0;
    // Get blocks latest
    const blockLatest = await this.getBlockLatest();
    let latestBlk = Number(blockLatest?.block?.header.height) || 0;

    if (height > 0) {
      currentBlk = height;
    } else {
      //Get current height
      const status = await this.statusRepository.findOne();
      if (status) {
        currentBlk = status.current_block;
      }
    }

    if (blockLatest) {
      this.threadProcess(currentBlk, latestBlk)
    }
  }

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
  @Interval(1000)
  async blockSyncError() {
    const result: BlockSyncError = await this.blockSyncErrorRepository.findOne({ order: { id: 'DESC' } });
    if (result) {
      await this.handleSyncData(result.height);
    }
  }
}
