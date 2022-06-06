import {MigrationInterface, QueryRunner} from "typeorm";

export class updateTransactionAddContractAddress1654244918223 implements MigrationInterface {
    name = 'updateTransactionAddContractAddress1654244918223'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`transactions\` ADD \`contract_address\` varchar(255) NOT NULL DEFAULT '' AFTER \`type\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`transactions\` DROP COLUMN \`contract_address\``);
    }

}
