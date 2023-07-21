import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateCw20TokenInfoTableTokenContracts1661148687675
  implements MigrationInterface
{
  name = 'updateCw20TokenInfoTableTokenContracts1661148687675';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`token_contracts\` ADD \`max_total_supply\` DECIMAL(30,6) NOT NULL DEFAULT '0.000000'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`token_contracts\` ADD \`price\` DECIMAL(30,6) NOT NULL DEFAULT '0.000000'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`token_contracts\` ADD \`price_change_percentage_24h\` FLOAT NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`token_contracts\` ADD \`volume_24h\` DECIMAL(30,6) NOT NULL DEFAULT '0.000000'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`token_contracts\` ADD \`circulating_market_cap\` DECIMAL(30,6) NOT NULL DEFAULT '0.000000'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`token_contracts\` ADD \`fully_diluted_market_cap\` DECIMAL(30,6) NOT NULL DEFAULT '0.000000'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`token_contracts\` ADD \`holders\` DECIMAL(30,6) NOT NULL DEFAULT '0.000000'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`token_contracts\` ADD \`holders_change_percentage_24h\` FLOAT NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_e69162f25cf34602b5cbedfb01\` ON \`nfts\``,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`nft_idx_contract_address_token_id_is_burn\` ON \`nfts\` (\`contract_address\`, \`token_id\`, \`is_burn\`)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`token_contracts\` DROP COLUMN \`holders_change_percentage_24h\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`token_contracts\` DROP COLUMN \`holders\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`token_contracts\` DROP COLUMN \`fully_diluted_market_cap\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`token_contracts\` DROP COLUMN \`circulating_market_cap\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`token_contracts\` DROP COLUMN \`volume_24h\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`token_contracts\` DROP COLUMN \`price_change_percentage_24h\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`token_contracts\` DROP COLUMN \`price\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`token_contracts\` DROP COLUMN \`max_total_supply\``,
    );
  }
}
