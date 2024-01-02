import { MigrationInterface, QueryRunner } from 'typeorm';

export class addUniqueChainIdDenomToTokenMarkets1701145590378
  implements MigrationInterface
{
  name = 'addUniqueChainIdDenomToTokenMarkets1701145590378';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`IDX_ee5edec6c978e77465b00cf4e9\` ON \`token_markets\` (\`chain_id\`, \`denom\`)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_ee5edec6c978e77465b00cf4e9\` ON \`token_markets\``,
    );
  }
}
