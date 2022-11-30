import { MigrationInterface, QueryRunner } from 'typeorm';

export class addFullyDilutedValuationIntoTokenmartketsTable1669777207372
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`token_markets\` ADD \`fully_diluted_valuation\` DECIMAL(38,6) NOT NULL DEFAULT 0.000000`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
