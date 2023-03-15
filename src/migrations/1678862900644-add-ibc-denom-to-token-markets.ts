import { MigrationInterface, QueryRunner } from 'typeorm';

export class addIbcDenomToTokenMarkets1678862900644
  implements MigrationInterface
{
  name = 'addIbcDenomToTokenMarkets1678862900644';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`token_markets\` ADD \`ibc_denom\` varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`token_markets\` DROP COLUMN \`ibc_denom\``,
    );
  }
}
