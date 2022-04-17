import { ProposalDeposit } from "../../../shared/entities/proposal-deposit.entity";
import { EntityRepository, Repository } from "typeorm";

@EntityRepository(ProposalDeposit)
export class ProposalDepositRepository extends Repository<ProposalDeposit> {}