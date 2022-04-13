import { Proposal } from '../../../shared/entities/proposal.entity';
import { EntityRepository, ObjectLiteral, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@EntityRepository(Proposal)
export class ProposalRepository extends Repository<Proposal> {
    constructor( @InjectRepository(Proposal) private readonly repos: Repository<ObjectLiteral>) {
        super();   
    }

    async deleteProposalsByListId(listId: []) {
        const sql = `UPDATE proposals SET is_delete = 1 WHERE pro_id NOT IN (?)`;
        return await this.repos.query(sql, [listId]);
    }
}