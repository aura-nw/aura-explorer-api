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

    async getProposalsByAddress(address: string) {
        const sql = `SELECT p.*,
                (SELECT pv.option FROM proposal_votes pv WHERE pv.proposal_id = p.pro_id AND pv.voter = ? LIMIT 1) AS vote_option
            FROM proposals p
            WHERE p.is_delete = 0
            ORDER BY p.pro_id DESC`;
        return await this.repos.query(sql, [address]);
    }
}