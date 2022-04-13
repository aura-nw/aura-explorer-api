import {MigrationInterface, QueryRunner} from "typeorm";

export class addColumnIsDeleteToTableProposals1649823512825 implements MigrationInterface {
    name = 'addColumnIsDeleteToTableProposals1649823512825'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`proposals\` ADD \`is_delete\` tinyint NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`proposals\` DROP COLUMN \`is_delete\``);
    }

}
