import { Injectable } from "@nestjs/common";
import { Like, MoreThan } from "typeorm";
import { AkcLogger, RequestContext } from "../../../shared";
import { ContractParamsDto } from "../dtos/contract-params.dto";
import { ContractRepository } from "../repositories/contract.repository";

@Injectable()
export class ContractService {
  constructor(
    private readonly logger: AkcLogger,
    private contractRepository: ContractRepository
  ) {
    this.logger.setContext(ContractService.name);
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
}