import {MigrationInterface, QueryRunner} from "typeorm";

export class updateContractTableAddVerifyTime1663051919960 implements MigrationInterface {
    name = 'updateContractTableAddVerifyTime1663051919960'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`smart_contracts\` ADD \`verified_at\` timestamp NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`smart_contracts\` RENAME COLUMN \`mainnet_code_id\` TO \`reference_code_id\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
