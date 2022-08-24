import { Injectable } from "@nestjs/common";
import { TokenContractRepository } from "../../../components/contract/repositories/token-contract.repository";
import { AkcLogger, CONTRACT_TYPE, RequestContext } from "../../../shared";
import { Cw721TokenParamsDto } from "../dtos/cw721-token-params.dto";
import { NftParamsDto } from "../dtos/nft-params.dto";
import { NftRepository } from "../repositories/nft.repository";
import { NftByOwnerParamsDto } from "../dtos/nft-by-owner-params.dto";

@Injectable()
export class Cw721TokenService {
    constructor(
        private readonly logger: AkcLogger,
        private tokenContractRepository: TokenContractRepository,
        private nftRepository: NftRepository
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
}