import { MigrationInterface, QueryRunner } from 'typeorm';

export class addUniqueTokenMarketsTable1670809504296
  implements MigrationInterface
{
  name = 'addUniqueTokenMarketsTable1670809504296';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`token_markets\` ADD UNIQUE INDEX \`IDX_94264568c451f4f826938950ee\` (\`contract_address\`)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`token_markets\` DROP INDEX \`IDX_94264568c451f4f826938950ee\``,
    );
  }
}
