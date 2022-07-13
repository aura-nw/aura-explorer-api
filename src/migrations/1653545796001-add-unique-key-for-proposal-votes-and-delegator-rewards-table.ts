import {MigrationInterface, QueryRunner} from "typeorm";

export class addUniqueKeyForProposalVotesAndDelegatorRewardsTable1653545796001 implements MigrationInterface {
    name = 'addUniqueKeyForProposalVotesAndDelegatorRewardsTable1653545796001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`tx_hash\` ON \`proposal_votes\``);
        await queryRunner.query(`CREATE UNIQUE INDEX \`DELEGATOR_REWARDS_UNIQUE_IDX\` ON \`delegator_rewards\` (\`tx_hash\`, \`delegator_address\`, \`validator_address\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`PROPOSAL_VOTES_UNIQUE_IDX\` ON \`proposal_votes\` (\`proposal_id\`, \`voter\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`PROPOSAL_VOTES_UNIQUE_IDX\` ON \`proposal_votes\``);
        await queryRunner.query(`DROP INDEX \`DELEGATOR_REWARDS_UNIQUE_IDX\` ON \`delegator_rewards\``);
    }

}
