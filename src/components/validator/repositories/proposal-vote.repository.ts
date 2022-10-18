import { ProposalVote } from '../../../shared/entities/proposal-vote.entity';
import { EntityRepository, ObjectLiteral, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@EntityRepository(ProposalVote)
export class ProposalVoteRepository extends Repository<ProposalVote> {
  constructor(
    @InjectRepository(ProposalVote)
    private readonly repos: Repository<ObjectLiteral>,
  ) {
    super();
  }

  async countVoteByAddress(address: Array<string>) {
    return await this.createQueryBuilder()
      .select('voter, COUNT(1) AS countVote')
      .where('voter IN (:...address)', {
        address: address,
      })
      .orderBy('voter')
      .getRawMany();
  }
}
