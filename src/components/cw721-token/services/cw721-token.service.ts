import { Injectable } from "@nestjs/common";
import { TokenContractRepository } from "../../../components/contract/repositories/token-contract.repository";
import { AkcLogger, CONTRACT_TRANSACTION_TYPE, CONTRACT_TYPE, RequestContext } from "../../../shared";
import { Cw721TokenParamsDto } from "../dtos/cw721-token-params.dto";
import { NftParamsDto } from "../dtos/nft-params.dto";
import { NftRepository } from "../repositories/nft.repository";
import { NftByOwnerParamsDto } from "../dtos/nft-by-owner-params.dto";
import { TransactionRepository } from "../../transaction/repositories/transaction.repository";
import { TokenTransactionRepository } from "../repositories/token-transaction.repository";
import { any } from "joi";

@Injectable()
export class Cw721TokenService {
    constructor(
        private readonly logger: AkcLogger,
        private tokenContractRepository: TokenContractRepository,
        private nftRepository: NftRepository,
        private transactionRepository: TransactionRepository,
        private tokenTransactionRepository: TokenTransactionRepository,
    ) {
        this.logger.setContext(Cw721TokenService.name);
    }

    async getCw721Tokens(ctx: RequestContext, request: Cw721TokenParamsDto): Promise<any> {
        this.logger.log(ctx, `${this.getCw721Tokens.name} was called!`);
        const result = await this.tokenContractRepository.getCw721Tokens(request);

        return { tokens: result[0], count: result[1][0].total };
    }

    async getNftsByContractAddress(ctx: RequestContext, contractAddress: string, request: NftParamsDto): Promise<any> {
        this.logger.log(ctx, `${this.getNftsByContractAddress.name} was called!`);
        const result = await this.nftRepository.getNftsByContractAddress(contractAddress, request);

        return { nfts: result[0], count: result[1][0].total };
    }

    async getNftByContractAddressAndTokenId(ctx: RequestContext, contractAddress: string, tokenId: string): Promise<any> {
        this.logger.log(ctx, `${this.getNftByContractAddressAndTokenId.name} was called!`);
        const nfts = await this.nftRepository.getNftByContractAddressAndTokenId(contractAddress, tokenId);

        return nfts.length > 0 ? nfts[0] : null;
    }

    async getNftsByOwner(ctx: RequestContext, request: NftByOwnerParamsDto): Promise<any> {
        this.logger.log(ctx, `${this.getNftsByOwner.name} was called!`);
        const result = await this.tokenContractRepository.getNftsByOwner(request);

        return { tokens: result[0], count: result[1][0].total };
    }

    /**
     * Get transactions by address
     * @param address 
     * @param type 
     * @param limit 
     * @param offset 
     * @returns 
     */
    async getTransactionContract(address: string, type: string, limit: number, offset: number): Promise<any> {
        const {transactions, count} = await this.transactionRepository.getTransactionContract(address, type, limit, offset);
        if (transactions) {
            const transactionBurn = await this.tokenTransactionRepository.getBurnByAddress(address);
            if (transactionBurn) {
                transactions.forEach((item) => {
                    const tokenId = this.getTokenId(item.messages);
                    const filter = transactionBurn.filter(f => Number(f.token_id) === Number(tokenId));
                    if(filter){
                        transactions['disabled'] = true;
                    }else{
                        transactions['disabled'] = false;
                    }
                });
            }
        }
        return {transactions, count};
    }

    /**
     * Get token id from message
     * @param message 
     * @returns 
     */
    getTokenId(message: any) {
        const msgObjects = JSON.parse(message);
        const msg = msgObjects[0];
        if (msg?.burn) {
            return msg?.burn.token_id;
        }else if (msg?.burn) {
            return msg?.mint.token_id;
        }else if (msg?.burn) {
            return msg?.transfer.token_id;
        }
    }
}