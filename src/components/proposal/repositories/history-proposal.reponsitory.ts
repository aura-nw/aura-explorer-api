import { EntityRepository, Repository } from "typeorm";
import { HistoryProposal } from "../../../shared/entities/history-proposal.entity";

@EntityRepository(HistoryProposal)
export class HistoryProposalRepository extends Repository<HistoryProposal> {}