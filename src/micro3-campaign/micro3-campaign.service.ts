import { HttpStatus, Injectable } from '@nestjs/common';
import { CampaignParamDto } from './dto/verify-micro3-campaign.dto';
import {
  ACTION_TYPE,
  HALO_ACTION_TYPE,
  MICRO3_CAMPAIGN,
  NATIVE,
  NULL_EVM_ADDRESS,
  PUNKGA_API,
} from './const/common';
import { Explorer } from '../shared/entities/explorer.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as util from 'util';
import { ServiceUtil } from '../shared/utils/service.util';
const HALO_BASE_URL = `https://api.%shalotrade.zone/api/v1/evm`;
const HALO_GRAPHQL_DEFAULT = `https://graph-api.%shalotrade.zone/subgraphs/name/halotrade/uniswap-v3`;
import axios from 'axios';
import { AkcLogger } from '../shared';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class Micro3CampaignService {
  constructor(
    private configService: ConfigService,
    private readonly logger: AkcLogger,
    private serviceUtil: ServiceUtil,
    @InjectRepository(Explorer)
    private explorerRepository: Repository<Explorer>,
  ) {}
  async verifyQuest(query: CampaignParamDto) {
    let result = false;
    const explorer = await this.explorerRepository.findOneOrFail({
      chainId: query.chainId,
    });
    const chain =
      explorer.chainDb == 'xstaxy'
        ? 'staging.'
        : explorer.chainDb == 'auratestnet'
        ? 'dev.'
        : `${explorer.chainDb}.`;

    switch (query.action) {
      case ACTION_TYPE.MintNft:
        result = await this.verifyMintNft(query);
        break;

      case ACTION_TYPE.HoldAura:
        result = await this.verifyHoldAura(query);
        break;

      case ACTION_TYPE.AddLiquidity:
        result = await this.verifyAddLiquidity(chain, query);
        break;

      case ACTION_TYPE.Swap:
        result = await this.verifySwap(chain, query);
        break;

      case ACTION_TYPE.Punkga:
        result = await this.verifyPunkga(query);
        break;

      default:
        return {
          error: {
            code: HttpStatus.BAD_REQUEST,
            message: 'Invalid action',
          },
          data: {
            result: false,
          },
        };
    }

    if (result) {
      return {
        data: {
          result: true,
        },
      };
    } else {
      return {
        error: {
          code: HttpStatus.BAD_REQUEST,
          message: 'Amount is not enough',
        },
        data: {
          result: false,
        },
      };
    }
  }
  async verifyPunkga(query: CampaignParamDto) {
    const endpoint =
      (this.configService.get('punkga.api') || PUNKGA_API) + query.address;

    const results = await this.fetchDataFromAPI(endpoint);

    if (results && results['user_level'].length > 0) {
      const lvl = results['user_level'][0].level;

      return lvl >= query.amount;
    } else {
      return false;
    }
  }
  async verifySwap(chain: string, query: CampaignParamDto) {
    return await this.verifyActionHalo(chain, HALO_ACTION_TYPE.Swap, query);
  }
  async verifyAddLiquidity(chain: string, query: CampaignParamDto) {
    return await this.verifyActionHalo(
      chain,
      HALO_ACTION_TYPE.AddLiquidity,
      query,
    );
  }
  async verifyHoldAura(query: CampaignParamDto) {
    const explorer = await this.explorerRepository.findOneOrFail({
      chainId: query.chainId,
    });
    const graphqlQuery = {
      query: util.format(MICRO3_CAMPAIGN.GRAPH_QL.HOLD_AURA, explorer.chainDb),
      variables: {
        address: query.address,
      },
      operationName: MICRO3_CAMPAIGN.OPERATION_NAME.HOLD_AURA,
    };

    const response = (await this.serviceUtil.fetchDataFromGraphQL(graphqlQuery))
      ?.data[explorer.chainDb];

    console.log(`Response: ${JSON.stringify(response)}`);
    if (!response) {
      return false;
    } else {
      const account = response.account_balance.filter(
        (item) =>
          item.type == NATIVE &&
          item.denom == explorer.minimalDenom &&
          Number(item.amount) >=
            Number(query.amount) * 10 ** Number(explorer.decimal),
      );
      console.log(
        `Query Amount: ${
          Number(query.amount) * 10 ** Number(explorer.decimal)
        }`,
      );
      console.log(`Account: ${JSON.stringify(account)}`);
      if (account.length > 0) {
        return true;
      }
    }
    return false;
  }
  async verifyMintNft(query: CampaignParamDto) {
    const explorer = await this.explorerRepository.findOneOrFail({
      chainId: query.chainId,
    });

    const graphqlQuery = {
      query: util.format(MICRO3_CAMPAIGN.GRAPH_QL.MINT_NFT, explorer.chainDb),
      variables: {
        from: NULL_EVM_ADDRESS,
        to: query.address,
        // heightGTE: 12000000,
        limit: Number(query.amount) || 10,
      },
      operationName: MICRO3_CAMPAIGN.OPERATION_NAME.MINT_NFT,
    };

    const response = (await this.serviceUtil.fetchDataFromGraphQL(graphqlQuery))
      .data[explorer.chainDb];

    if (!response) {
      return false;
    } else {
      console.log(
        `Nft Mint Limit: ${JSON.stringify(response.erc721_activity.length)}`,
      );
      return response.erc721_activity.length >= Number(query.amount);
    }
  }

  async verifyActionHalo(
    chain: string,
    action: HALO_ACTION_TYPE,
    query: CampaignParamDto,
  ) {
    console.log(`Query: ${JSON.stringify(query)}`);
    switch (query.uniVersion) {
      case 2:
        return await this.verifyWithUniV2(chain, action, query);

      case 3:
        return await this.verifyWithUniV3(chain, action, query);

      default:
        return await this.verifyWithUniV3(chain, action, query);
    }
  }

  async verifyWithUniV2(
    chain: string,
    action: HALO_ACTION_TYPE,
    query: CampaignParamDto,
  ) {
    const senders = await this.getSenderFromHalo(chain, action);
    console.log(`senders: ${JSON.stringify(senders)}`);
    console.log(`query: ${JSON.stringify(query)}`);

    const filterByAddress = senders.filter((sender) => sender == query.address);
    console.log(`filterByAddress: ${JSON.stringify(filterByAddress)}`);

    if (filterByAddress.length >= Number(query.amount)) {
      return true;
    }
    return false;
  }

  async verifyWithUniV3(chain: string, action: HALO_ACTION_TYPE, query: any) {
    const endpoint = `${util.format(
      this.configService.get('haloTrade.graphQL') ?? HALO_GRAPHQL_DEFAULT,
      chain,
    )}`;
    const graphqlQuery = this.generateQuery(action, query);

    const response = (
      await this.serviceUtil.fetchDataFromGraphQL(graphqlQuery, endpoint)
    )?.data;

    console.log(`response: ${JSON.stringify(response)}`);
    if (!response) {
      return false;
    } else {
      return response.data?.length >= Number(query.amount);
    }
  }

  generateQuery(action: HALO_ACTION_TYPE, query: CampaignParamDto) {
    let graphqlQuery = {};
    switch (action) {
      case HALO_ACTION_TYPE.Swap:
        graphqlQuery = {
          query: util.format(MICRO3_CAMPAIGN.GRAPH_QL.SWAP),
          variables: {
            origin: query.address,
          },
        };
        break;

      case HALO_ACTION_TYPE.AddLiquidity:
        graphqlQuery = {
          query: util.format(MICRO3_CAMPAIGN.GRAPH_QL.ADD_LP),
          variables: {
            origin: query.address,
          },
        };
        break;
    }

    return graphqlQuery;
  }

  async getSenderFromHalo(chain: string, action: HALO_ACTION_TYPE, method?) {
    const getPoolUrl = `${util.format(
      HALO_BASE_URL,
      chain,
    )}/halo-pool/poolList`;
    const pools = await this.fetchDataFromAPI(getPoolUrl, method);

    console.log(pools);
    if (!pools) {
      return null;
    }
    const poolIds = pools.data.res.results?.map((pool) => pool.id);
    if (!poolIds) {
      return null;
    }

    let senderResult = [];
    for (const poolId of poolIds) {
      const getTxsUrl = `${util.format(
        HALO_BASE_URL,
        chain,
      )}/analytics/transactions?pageSize=10&type=${action}&poolId=${poolId}&sortBy=timeStamp&sortOrder=desc`;

      const txs = await this.fetchDataFromAPI(getTxsUrl, method);
      if (txs) {
        console.log(txs.data.res.results.map((tx) => tx.sender));
        senderResult = senderResult.concat(
          txs.data.res.results.map((tx) => tx.sender),
        );
      }
    }

    return senderResult;
  }

  async fetchDataFromAPI(endpoint, method?) {
    method = method ? method : 'GET';

    try {
      const response = await axios({
        url: endpoint,
        method: method,
        timeout: 30000,
      });

      if (response.data?.errors?.length > 0) {
        this.logger.error(
          response.data.errors,
          `Error while querying ${JSON.stringify(response.data.errors)}`,
        );
        return null;
      }

      return response.data;
    } catch (error) {
      this.logger.error(endpoint, `Error while querying ${error}`);
      return null;
    }
  }
}
