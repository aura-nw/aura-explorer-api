import { ProposalVote } from "../../../shared/entities/proposal-vote.entity";
import { EntityRepository, Repository } from "typeorm";

@EntityRepository(ProposalVote)
export class ProposalVoteRepository extends Repository<ProposalVote> {}