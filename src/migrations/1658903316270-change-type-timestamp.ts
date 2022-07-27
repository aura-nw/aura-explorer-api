import {MigrationInterface, QueryRunner} from "typeorm";

export class changeTypeTimestamp1658903316270 implements MigrationInterface {
    name = 'changeTypeTimestamp1658903316270'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`blocks\` CHANGE \`timestamp\` \`timestamp\` TIMESTAMP NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`transactions\` CHANGE \`timestamp\` \`timestamp\` TIMESTAMP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {}

}
