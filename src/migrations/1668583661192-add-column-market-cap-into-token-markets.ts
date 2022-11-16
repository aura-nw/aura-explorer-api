import { MigrationInterface, QueryRunner } from 'typeorm';

export class addColumnMarketCapIntoTokenMarkets1668583661192
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`token_markets\` ADD \`market_cap\` DECIMAL(38,6) NOT NULL DEFAULT 0.000000`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
