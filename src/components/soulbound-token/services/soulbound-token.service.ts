import { Body, Injectable } from '@nestjs/common';
import { AkcLogger, RequestContext, SoulboundToken, SOULBOUND_TOKEN_STATUS } from '../../../shared';
import { SmartContractRepository } from '../../contract/repositories/smart-contract.repository';
import { TokenParasDto } from '../dtos/token-paras.dto';
import { CreateSoulboundTokenParamsDto } from '../dtos/create-soulbound-token-params.dto';
import { SoulboundContractOutputDto } from '../dtos/soulbound-contract-output.dto';
import { SoulboundContractParasDto } from '../dtos/soulbound-contract-paras.dto';
import { UpdateSoulboundTokenParamsDto } from '../dtos/update-soulbound-token-params.dto';
import { SoulboundTokenRepository } from '../repositories/soulbound-token.repository';
import { TokenOutputDto } from '../dtos/token-output.dto';
import { plainToClass } from 'class-transformer';


@Injectable()
export class SoulboundTokenService {
    constructor(
        private readonly logger: AkcLogger,
        private soulboundTokenRepos: SoulboundTokenRepository,
        private smartContractRepos: SmartContractRepository
    ) {
    }

    /**
     * Get data contract soulbound token
     * @param ctx 
     * @param req 
     * @returns 
     */
    async getContracts(ctx: RequestContext, req: SoulboundContractParasDto) {
        this.logger.log(ctx, `============== ${this.getContracts.name} was called with paras: ${JSON.stringify(req)}! ==============`);
        const { contracts, count } = await this.smartContractRepos.getContractByMinter(req.minterAddress, req.limit, req.offset);
        const contractIds = contracts?.map(item => item.id);
        const results: SoulboundContractOutputDto[] = [];
        if (contractIds.length > 0) {
            const status = await this.soulboundTokenRepos.countStatus(contractIds);
            contracts.forEach((item: any) => {
                let soulboundContract = new SoulboundContractOutputDto();
                let claimedQty = 0, unclaimedQty = 0;
                soulboundContract = { ...item };

                status?.find(f => f.smart_contract_id === item.smart_contract_id)?.forEach(m => {
                    if (m.status === SOULBOUND_TOKEN_STATUS.EQUIPPED) {
                        claimedQty = Number(m.quanity) || 0;
                    } else {
                        unclaimedQty = Number(m.quanity) || 0;
                    }
                });

                soulboundContract.total = (claimedQty + unclaimedQty);
                soulboundContract.claimed_qty = claimedQty;
                soulboundContract.unclaimed_qty = unclaimedQty;
                results.push(soulboundContract);
            });
        }
        return { contracts: results, count };
    }

    /**
     * Get list tokens by minter address and contract address
     * @param ctx 
     * @param req 
     * @returns 
     */
    async getTokens(ctx: RequestContext, req: TokenParasDto) {
        this.logger.log(ctx, `============== ${this.getTokens.name} was called with paras: ${JSON.stringify(req)}! ==============`);
        const {tokens, count} = await this.soulboundTokenRepos.getTokens(req.minterAddress, req.contractAddress, req.limit, req.offset);
        const data = plainToClass(TokenOutputDto, tokens, {
            excludeExtraneousValues: true,
          });
        return {data, count};
    }

    /**
     * Create token of Soulbound contract which user can clain or mint token
     * @param ctx 
     * @param req 
     * @returns 
     */
    async create(ctx: RequestContext, @Body() req: CreateSoulboundTokenParamsDto) {
        this.logger.log(ctx, `============== ${this.create.name} was called with paras: ${JSON.stringify(req)}! ==============`);
        let entity = new SoulboundToken();
        const contract = await this.smartContractRepos.findOne({
            where: {
                contract_address: req.contract_address,
                minter_address: req.attestor_address
            }
        });
        if(contract){
            entity.smart_contract_id = contract.code_id;
            entity.status = SOULBOUND_TOKEN_STATUS.UNCLAIM;
            entity.receiver_address = req.receiver_address;
            entity.token_uri = req.token_uri;
            entity.token_id = '';

            return await this.soulboundTokenRepos.save(entity);
        }
        return null;
    }

    /**
     * Update status token of Soulbound contract
     * @param ctx 
     * @param req 
     * @returns 
     */
    async update(ctx: RequestContext, @Body() req: UpdateSoulboundTokenParamsDto) {
        this.logger.log(ctx, `============== ${this.update.name} was called with paras: ${JSON.stringify(req)}! ==============`);
        let entity = await this.soulboundTokenRepos.findOne(req.id);
        entity.status = req.status;
        entity.signature = req.signature;
        return await this.soulboundTokenRepos.update(entity.id, entity);
    }
}