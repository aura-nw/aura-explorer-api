import { MigrationInterface, QueryRunner } from 'typeorm';

export class addUniqueTokenMarketsTable1670809504296
  implements MigrationInterface
{
  name = 'addUniqueTokenMarketsTable1670809504296';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`token_markets\` ADD UNIQUE INDEX \`IDX_94264568c451f4f826938950ee\` (\`contract_address\`)`,
    );
    await queryRunner.query(
      `INSERT INTO \`token_markets\` (\`contract_address\`, \`coin_id\`, \`symbol\` , \`name\`, \`code_id\`, \`image\`) VALUES('0x5b0dfe077b16479715c9838eb644892008abbfe6', 'bitcoin', 'btc', 'Bitcoin', 0, 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png?1547033579')`,
    );
    await queryRunner.query(
      `INSERT INTO \`token_markets\` (\`contract_address\`, \`coin_id\`, \`symbol\` , \`name\`, \`code_id\`, \`image\`) VALUES('0x23c5d1164662758b3799103effe19cc064d897d6', 'aura-network', 'aura', 'Aura Network', 0, 'https://assets.coingecko.com/coins/images/25768/large/LOGO-AURA-WHITE.png?1653604372')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`token_markets\` DROP INDEX \`IDX_94264568c451f4f826938950ee\``,
    );
  }
}
