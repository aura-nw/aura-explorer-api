import { Injectable } from '@nestjs/common';
import * as util from 'util';
import { SmartContractRepository } from '../../../components/contract/repositories/smart-contract.repository';
import {
  AkcLogger,
  AURA_INFO,
  INDEXER_API_V2,
  LENGTH,
  RequestContext,
} from '../../../shared';
import * as appConfig from '../../../shared/configs/configuration';
import { ServiceUtil } from '../../../shared/utils/service.util';
import { Cw721TokenParamsDto } from '../dtos/cw721-token-params.dto';
import { NftByOwnerParamsDto } from '../dtos/nft-by-owner-params.dto';
import { NftByContractParamsDto } from '../dtos/nft-by-contract-params.dto';

@Injectable()
export class Cw721TokenService {
  private appParams;
  private chainDB;

  constructor(
    private readonly logger: AkcLogger,
    private smartContractRepository: SmartContractRepository,
    private serviceUtil: ServiceUtil,
  ) {
    this.logger.setContext(Cw721TokenService.name);
    this.appParams = appConfig.default();
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
    const cw721Attributes = `id
      token_id
      owner
      media_info
      burned
      cw721_contract {
        smart_contract {
          address
        }
      }`;

    const whereClause: any = {
      cw721_contract: {
        smart_contract: { address: { _eq: contractAddress } },
      },
      token_id: { _eq: tokenId },
    };

    const graphqlQuery = {
      query: util.format(
        INDEXER_API_V2.GRAPH_QL.CW721_OWNER,
        this.chainDB,
        cw721Attributes,
      ),
      variables: {
        whereClause: whereClause,
        limit: 1,
      },
    };

    const tokens = (await this.serviceUtil.fetchDataFromGraphQL(graphqlQuery))
      .data[this.chainDB]['cw721_token'];

    let nft = null;

    if (tokens?.length > 0) {
      nft = tokens[0];
      nft.owner = nft.burned ? '' : nft.owner;
    }
    return nft;
  }

  async getNftsByOwner(
    ctx: RequestContext,
    request: NftByOwnerParamsDto,
  ): Promise<any> {
    this.logger.log(ctx, `${this.getNftsByOwner.name} was called!`);
    const cw721Attributes = `id
      token_id
      owner
      media_info
      burned
       cw721_contract {
        name
        smart_contract {
          name
          address
        }
      }`;

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
        cw721Attributes,
      ),
      variables: {
        whereClause: whereClause,
        limit: request?.limit,
      },
    };

    const tokens = (await this.serviceUtil.fetchDataFromGraphQL(graphqlQuery))
      .data[this.chainDB]['cw721_token'];
    const count = tokens?.length;

    return { tokens: tokens, count: count };
  }
}
