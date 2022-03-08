import {MigrationInterface, QueryRunner} from "typeorm";

export class updateTransaction1646719538765 implements MigrationInterface {
    name = 'updateTransaction1646719538765'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`transactions\` DROP COLUMN \`tx\``);
        await queryRunner.query(`ALTER TABLE \`transactions\` ADD \`tx\` json NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`transactions\` DROP COLUMN \`fee\``);
        await queryRunner.query(`ALTER TABLE \`transactions\` ADD \`fee\` text NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`transactions\` DROP COLUMN \`messages\``);
        await queryRunner.query(`ALTER TABLE \`transactions\` ADD \`messages\` json NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`transactions\` DROP COLUMN \`tx\``);
        await queryRunner.query(`ALTER TABLE \`transactions\` ADD \`tx\` text NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`transactions\` DROP COLUMN \`fee\``);
        await queryRunner.query(`ALTER TABLE \`transactions\` ADD \`fee\` text NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`transactions\` DROP COLUMN \`messages\``);
        await queryRunner.query(`ALTER TABLE \`transactions\` ADD \`messages\` text NOT NULL`);
    }

}
