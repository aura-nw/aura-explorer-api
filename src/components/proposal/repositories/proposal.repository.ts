import { Proposal } from '../../../shared/entities/proposal.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(Proposal)
export class ProposalRepository extends Repository<Proposal> {}