import {MigrationInterface, QueryRunner} from "typeorm";

export class addUniqueKeyForProposalVotesAndDelegatorRewardsTable1653545796001 implements MigrationInterface {
    name = 'addUniqueKeyForProposalVotesAndDelegatorRewardsTable1653545796001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`tx_hash\` ON \`proposal_votes\``);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_106c954bfc59f5e3e23f5f8490\` ON \`delegator_rewards\` (\`tx_hash\`, \`delegator_address\`, \`validator_address\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_215d2f862627e4a73384af9671\` ON \`proposal_votes\` (\`proposal_id\`, \`voter\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_215d2f862627e4a73384af9671\` ON \`proposal_votes\``);
        await queryRunner.query(`DROP INDEX \`IDX_106c954bfc59f5e3e23f5f8490\` ON \`delegator_rewards\``);
    }

}
