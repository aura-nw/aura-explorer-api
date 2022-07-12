import {MigrationInterface, QueryRunner} from "typeorm";

export class addUniqueKeyForProposalVotesAndDelegatorRewardsTable1653545796001 implements MigrationInterface {
    name = 'addUniqueKeyForProposalVotesAndDelegatorRewardsTable1653545796001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // remove data duplicate in delegator_rewards and proposal_votes table
        await queryRunner.query(`DELETE c1 
            FROM delegator_rewards c1 
                INNER JOIN delegator_rewards c2 
            WHERE c1.id > c2.id AND c1.tx_hash = c2.tx_hash AND c1.delegator_address = c2.delegator_address AND c1.validator_address = c2.validator_address`);
            await queryRunner.query(`DELETE c1 
                FROM proposal_votes c1 
                    INNER JOIN proposal_votes c2 
                WHERE c1.id > c2.id AND c1.proposal_id = c2.proposal_id AND c1.voter = c2.voter`);
        await queryRunner.query(`DROP INDEX \`tx_hash\` ON \`proposal_votes\``);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_106c954bfc59f5e3e23f5f8490\` ON \`delegator_rewards\` (\`tx_hash\`, \`delegator_address\`, \`validator_address\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_215d2f862627e4a73384af9671\` ON \`proposal_votes\` (\`proposal_id\`, \`voter\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_215d2f862627e4a73384af9671\` ON \`proposal_votes\``);
        await queryRunner.query(`DROP INDEX \`IDX_106c954bfc59f5e3e23f5f8490\` ON \`delegator_rewards\``);
    }

}
