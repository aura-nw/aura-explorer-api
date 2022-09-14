import { Injectable } from "@nestjs/common";
import { TokenContractRepository } from "../../../components/contract/repositories/token-contract.repository";
import { AkcLogger, CONTRACT_TYPE, INDEXER_API, RequestContext, SEARCH_KEYWORD } from "../../../shared";
import { Cw721TokenParamsDto } from "../dtos/cw721-token-params.dto";
import { NftByOwnerParamsDto } from "../dtos/nft-by-owner-params.dto";
import { TransactionRepository } from "../../transaction/repositories/transaction.repository";
import { TokenCW721TransactionParasDto } from "../dtos/token-cw721-transaction-paras.dto";
import { ServiceUtil } from "../../../shared/utils/service.util";
import * as appConfig from '../../../shared/configs/configuration';
import * as util from 'util';
import { SmartContractRepository } from "../../../components/contract/repositories/smart-contract.repository";

@Injectable()
export class Cw721TokenService {
    private appParams;
    private indexerUrl;
    private indexerChainId;

    constructor(
        private readonly logger: AkcLogger,
        private tokenContractRepository: TokenContractRepository,
        private smartContractRepository: SmartContractRepository,
        private serviceUtil: ServiceUtil
    ) {
        this.logger.setContext(Cw721TokenService.name);
        this.appParams = appConfig.default();
        this.indexerUrl = this.appParams.indexer.url;
        this.indexerChainId = this.appParams.indexer.chainId;
    }

    async getCw721Tokens(ctx: RequestContext, request: Cw721TokenParamsDto): Promise<any> {
        this.logger.log(ctx, `${this.getCw721Tokens.name} was called!`);
        const result = await this.tokenContractRepository.getCw721Tokens(request);

        return { tokens: result[0], count: result[1][0].total };
    }

    async getNftByContractAddressAndTokenId(ctx: RequestContext, contractAddress: string, tokenId: string): Promise<any> {
        this.logger.log(ctx, `${this.getNftByContractAddressAndTokenId.name} was called!`);
        const result = await this.serviceUtil.getDataAPI(`${this.indexerUrl}${util.format(INDEXER_API.GET_NFT_BY_CONTRACT_ADDRESS_AND_TOKEN_ID, this.indexerChainId, CONTRACT_TYPE.CW721, tokenId, contractAddress)}`, '', ctx);
        let nft = null;
        if (result && result.data.assets.CW721.asset.length > 0) {
            nft = result.data.assets.CW721.asset[0];
            const contract = await this.smartContractRepository.findOne({
                where: { contract_address: contractAddress }
            });
            nft.name = '';
            nft.creator = '';
            nft.symbol = '';
            if (contract) {
                nft.name = contract.token_name;
                nft.creator = contract.creator_address;
                nft.symbol = contract.token_symbol;
            }
            nft.owner = nft.is_burned ? '' : nft.owner
        }
        return nft;
    }

    async getNftsByOwner(ctx: RequestContext, request: NftByOwnerParamsDto): Promise<any> {
        this.logger.log(ctx, `${this.getNftsByOwner.name} was called!`);
        let url: string = INDEXER_API.GET_NFTS_BY_OWNER;
        const params = [request.account_address, this.indexerChainId, CONTRACT_TYPE.CW721, request.limit, request.offset]
        if (request.contract_address) {
            url += '&%s=%s';
            params.push(SEARCH_KEYWORD.CONTRACT_ADDRESS);
            params.push(request.contract_address);
        }
        if (request.token_id) {
            url += '&%s=%s';
            params.push(SEARCH_KEYWORD.TOKEN_ID);
            params.push(request.token_id);
        }
        const result = await this.serviceUtil.getDataAPI(`${this.indexerUrl}${util.format(url, ...params)}`, '', ctx);
        const tokens = result.data.assets.CW721.asset;
        const count = result.data.assets.CW721.count;
        if (count > 0) {
            const listContractAddress = [...new Set(tokens.map(i => i.contract_address))];
            const tokensInfo = await this.tokenContractRepository.getTokensByListContractAddress(listContractAddress);
            tokens.forEach((item) => {
                item.token_name = '';
                item.symbol = '';
                const filter = tokensInfo.filter(f => String(f.contract_address) === item.contract_address);
                if (filter?.length > 0) {
                    item.token_name = filter[0].token_name;
                    item.symbol = filter[0].symbol;
                }
            });
        }

        return { tokens: tokens, count: count };
    }

    /**
     * Get transactions by address
     * @param address 
     * @param type 
     * @param limit 
     * @param offset 
     * @returns 
     */
    // async getTransactionContract(req: TokenCW721TransactionParasDto): Promise<[any, number]> {
    //     const [transactions, count] = await this.transactionRepository.getTransactionContract(req.contract_address, req.account_address, req.tx_hash, req.token_id, req.limit, req.offset);
    //     if (transactions) {
    //         const transactionBurn = await this.tokenTransactionRepository.getBurnByAddress(req.contract_address);
    //         transactions.forEach((item) => {
    //             item['disabled'] = false;
    //             if (transactionBurn?.length > 0) {
    //                 const filter = transactionBurn.filter(f => String(f.token_id) === item.token_id
    //                     && Number(item.height) <= Number(f.height));
    //                 if (filter?.length > 0) {
    //                     item['disabled'] = true;
    //                 }
    //             }
    //         });
    //     }
    //     return [transactions, count];
    // }

    /**
     * Get transactions by Address and Token Id
     * @param address 
     * @param tokenType 
     * @param token_id 
     * @param limit 
     * @param offset 
     * @returns 
     */
    // async viewNTFTransaction(address: string, token_id, limit: number, offset: number): Promise<[any, number]> {
    //     return await this.transactionRepository.viewNTFTransaction(address, CONTRACT_TYPE.CW721, token_id, limit, offset);
    // }
}