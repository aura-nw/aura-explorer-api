import {MigrationInterface, QueryRunner} from "typeorm";

export class historyProposalsChangeColumnType1649836830143 implements MigrationInterface {
    name = 'historyProposalsChangeColumnType1649836830143'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`history_proposals\` MODIFY \`amount\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`history_proposals\` MODIFY \`proposer\` varchar(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> { }

}
