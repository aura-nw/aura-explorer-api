import { Injectable } from '@nestjs/common';
import * as util from 'util';
import { SmartContractRepository } from '../../../components/contract/repositories/smart-contract.repository';
import {
  AkcLogger,
  AURA_INFO,
  CONTRACT_TYPE,
  INDEXER_API,
  INDEXER_API_V2,
  LENGTH,
  RequestContext,
  SEARCH_KEYWORD,
} from '../../../shared';
import * as appConfig from '../../../shared/configs/configuration';
import { ServiceUtil } from '../../../shared/utils/service.util';
import { Cw721TokenParamsDto } from '../dtos/cw721-token-params.dto';
import { NftByOwnerParamsDto } from '../dtos/nft-by-owner-params.dto';

@Injectable()
export class Cw721TokenService {
  private appParams;
  private indexerUrl;
  private indexerChainId;
  private chainDB;

  constructor(
    private readonly logger: AkcLogger,
    private smartContractRepository: SmartContractRepository,
    private serviceUtil: ServiceUtil,
  ) {
    this.logger.setContext(Cw721TokenService.name);
    this.appParams = appConfig.default();
    this.indexerUrl = this.appParams.indexer.url;
    this.indexerChainId = this.appParams.indexer.chainId;
    this.chainDB = this.appParams.indexerV2.chainDB;
  }

  async getCw721Tokens(
    ctx: RequestContext,
    request: Cw721TokenParamsDto,
  ): Promise<any> {
    this.logger.log(ctx, `${this.getCw721Tokens.name} was called!`);
    const result = await this.smartContractRepository.getCw721Tokens(request);

    return { tokens: result[0], count: result[1] };
  }

  async getNftByContractAddressAndTokenId(
    ctx: RequestContext,
    contractAddress: string,
    tokenId: string,
  ): Promise<any> {
    this.logger.log(
      ctx,
      `${this.getNftByContractAddressAndTokenId.name} was called!`,
    );
    const url = `${this.indexerUrl}${util.format(
      INDEXER_API.GET_NFT_BY_CONTRACT_ADDRESS_AND_TOKEN_ID,
      this.indexerChainId,
      CONTRACT_TYPE.CW721,
      encodeURIComponent(tokenId),
      contractAddress,
    )}`;
    const result = await this.serviceUtil.getDataAPI(url, '', ctx);
    let nft = null;
    if (result && result.data.assets.CW721.asset.length > 0) {
      nft = result.data.assets.CW721.asset[0];
      const contract = await this.smartContractRepository.findOne({
        where: { contract_address: contractAddress },
      });
      nft.name = '';
      nft.creator = '';
      nft.symbol = '';
      if (contract) {
        nft.name = contract.token_name;
        nft.creator = contract.creator_address;
        nft.symbol = contract.token_symbol;
      }
      nft.owner = nft.is_burned ? '' : nft.owner;
    }
    return nft;
  }

  async getNftsByOwner(
    ctx: RequestContext,
    request: NftByOwnerParamsDto,
  ): Promise<any> {
    this.logger.log(ctx, `${this.getNftsByOwner.name} was called!`);
    let url: string = INDEXER_API.GET_NFTS_BY_OWNER;
    // get account detail
    const accountAttributes = `id
      token_id
      owner
      media_info
      cw721_contract {
        smart_contract {
          address
        }
      }
      `;

    let whereClause: any = {
      owner: { _eq: request?.account_address },
      burned: { _eq: false },
    };

    if (request?.keyword) {
      if (
        request.keyword.startsWith(AURA_INFO.CONTRACT_ADDRESS) &&
        request.keyword.length === LENGTH.CONTRACT_ADDRESS
      ) {
        whereClause = {
          ...whereClause,
          cw721_contract: {
            smart_contract: { address: { _eq: request.keyword } },
          },
        };
      } else {
        whereClause = {
          ...whereClause,
          token_id: { _eq: request.keyword },
        };
      }
    }

    if (request?.next_key) {
      whereClause = {
        ...whereClause,
        id: { _gt: request.next_key },
      };
    }

    const graphqlQuery = {
      query: util.format(
        INDEXER_API_V2.GRAPH_QL.CW721_OWNER,
        this.chainDB,
        accountAttributes,
      ),
      variables: {
        whereClause: whereClause,
        limit: request?.limit,
      },
    };

    const response = (await this.serviceUtil.fetchDataFromGraphQL(graphqlQuery))
      .data[this.chainDB]['cw721_token'];
    
    const tokens = response.data.assets.CW721.asset;
    const count = result.data.assets.CW721.count;
    const nextKey = result.data.nextKey;
    if (tokens.length > 0) {
      const listContractAddress = [
        ...new Set(tokens.map((i) => i.contract_address)),
      ];
      const tokensInfo =
        await this.smartContractRepository.getTokensByListContractAddress(
          listContractAddress,
        );
      tokens.forEach((item) => {
        item.token_name = '';
        item.symbol = '';
        item.decimals = 0;
        const filter = tokensInfo.filter(
          (f) => String(f.contract_address) === item.contract_address,
        );
        if (filter?.length > 0) {
          item.token_name = filter[0].token_name;
          item.symbol = filter[0].symbol;
          item.decimals = filter[0].decimals;
        }
      });
    }

    return { tokens: tokens, count: count, next_key: nextKey };
  }
}
