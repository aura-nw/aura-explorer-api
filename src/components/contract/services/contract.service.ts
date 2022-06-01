import { Injectable } from "@nestjs/common";
import { ServiceUtil } from "../../../shared/utils/service.util";
import { Like, MoreThan } from "typeorm";
import { AkcLogger, RequestContext } from "../../../shared";
import { ContractParamsDto } from "../dtos/contract-params.dto";
import { ContractRepository } from "../repositories/contract.repository";
import { ConfigService } from "@nestjs/config";
import { TagRepository } from "../repositories/tag.repository";

@Injectable()
export class ContractService {
  private api;

  constructor(
    private readonly logger: AkcLogger,
    private contractRepository: ContractRepository,
    private tagRepository: TagRepository,
    private serviceUtil: ServiceUtil,
    private configService: ConfigService
  ) {
    this.logger.setContext(ContractService.name);
    this.api = this.configService.get('API');
  }

  async getContracts(ctx: RequestContext, request: ContractParamsDto): Promise<any> {
    const [contracts, count] = await this.contractRepository.findAndCount({
      where: {
        id: MoreThan(0),
        ...(request?.keyword && { contract_name: Like(`%${request.keyword}%`) })
      },
      order: { updated_at: 'DESC' },
      take: request.limit,
      skip: request.offset,
    });

    return { contracts: contracts, count };
  }

  async getContractByAddress(ctx: RequestContext, contractAddress: string): Promise<any> {
    this.logger.log(ctx, `${this.getContractByAddress.name} was called!`);
    let contract: any = null;
    const contractData = await this.contractRepository.findOne({
      where: { contract_address: contractAddress },
    });
    if (contractData) {
      contract = contractData;
      const balanceParams = `cosmos/bank/v1beta1/balances/${contractAddress}`;
      const [
        balanceData
      ] = await Promise.all([
        this.serviceUtil.getDataAPI(this.api, balanceParams, ctx)
      ]);
      contract.balance = 0;
      if (balanceData && balanceData?.balances && balanceData?.balances?.length > 0) {
        contract.balance = Number(balanceData.balances[0].amount);
      }
    }
    return contract;
  }

  async getTagByAddress(ctx: RequestContext, accountAddress: string, contractAddress: string): Promise<any> {
    this.logger.log(ctx, `${this.getTagByAddress.name} was called!`);
    const tag = this.tagRepository.findOne({
      where: {account_address: accountAddress, contract_address: contractAddress}
    });

    return tag;
  }
}