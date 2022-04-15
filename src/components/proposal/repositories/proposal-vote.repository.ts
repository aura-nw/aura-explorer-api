import { ProposalVote } from "../../../shared/entities/proposal-vote.entity";
import { EntityRepository, ObjectLiteral, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { ProposalVoteByOptionInput } from "../dtos/proposal-vote-by-option-input.dto";
import { ProposalVoteByValidatorInput } from "../dtos/proposal-vote-by-validator-input.dto";

@EntityRepository(ProposalVote)
export class ProposalVoteRepository extends Repository<ProposalVote> {
    constructor( @InjectRepository(ProposalVote) private readonly repos: Repository<ObjectLiteral>) {
        super();   
    }

    async getProposalVotesByOption(request: ProposalVoteByOptionInput) {
        let params = [];
        let sql = `SELECT * 
            FROM proposal_votes 
            WHERE proposal_id = ?`;
        params.push(request.proposalId);
        if (request.option !== '') {
            sql += " AND `option` = ?";
            params.push(request.option);
        }
        sql += ` ORDER BY updated_at DESC`;
        sql += ` LIMIT ? OFFSET ?`;
        params.push(request.limit);
        params.push(request.offset * request.limit);

        return await this.repos.query(sql, params);
    }

    async getProposalVotesByValidator(request: ProposalVoteByValidatorInput, isLimit: boolean) {
        let params = [];
        let sql = `SELECT v.title AS validator_name, v.acc_address AS validator_address, pv.tx_hash, pv.option, pv.created_at, v.operator_address,
            (@cnt := @cnt + 1) AS 'rank'
            FROM validators v
                LEFT JOIN proposal_votes pv ON v.acc_address = pv.voter AND pv.proposal_id = ?
                CROSS JOIN (SELECT @cnt := 0) AS dummy`;
        params.push(request.proposalId);
        if (request.option !== '') {
            sql += ` WHERE pv.option = ?`;
            params.push(request.option);
        }
        sql += ` ORDER BY pv.updated_at DESC`;
        if (isLimit) {
            sql += ` LIMIT ? OFFSET ?`;
            params.push(request.limit);
            params.push(request.offset * request.limit);
        }

        return await this.repos.query(sql, params);
    }
}