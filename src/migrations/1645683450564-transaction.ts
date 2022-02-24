import {MigrationInterface, QueryRunner} from "typeorm";

export class transaction1645683450564 implements MigrationInterface {
    name = 'transaction1645683450564'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`transactions\` ADD \`fee\` text NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`transactions\` ADD \`messages\` text NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`transactions\` DROP COLUMN \`messages\``);
        await queryRunner.query(`ALTER TABLE \`transactions\` DROP COLUMN \`fee\``);
    }

}
