import {MigrationInterface, QueryRunner} from "typeorm";

export class updateTableTokenContracts1659321056909 implements MigrationInterface {
    name = 'updateTableTokenContracts1659321056909'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // await queryRunner.query(`DROP INDEX \`contract_address\` ON \`token_contracts\``);
        await queryRunner.query(`ALTER TABLE \`token_contracts\` ADD \`asset_id\` VARCHAR(255) NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`token_contracts_idx_asset_id\` ON \`token_contracts\` (\`asset_id\`)`);
        await queryRunner.query(`ALTER TABLE \`token_contracts\` CHANGE \`decimal\` \`decimals\` INT NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`token_contracts\` CHANGE \`max_total_supply\` \`total_supply\` DECIMAL(30, 6) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`token_contracts\` CHANGE \`description\` \`description\` TEXT NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`token_contracts\` DROP COLUMN \`is_main_token\``);
        await queryRunner.query(`ALTER TABLE \`token_contracts\` ADD \`balance\` DECIMAL(30, 6) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`token_contracts\` ADD \`owner\` VARCHAR(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> { }

}
