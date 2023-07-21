import { MigrationInterface, QueryRunner } from 'typeorm';

export class dropColumnTotalSupplyTableTokenContracts1661134816821
  implements MigrationInterface
{
  name = 'dropColumnTotalSupplyTableTokenContracts1661134816821';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`token_contracts\` DROP COLUMN \`total_supply\``,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`token_contracts\` ADD \`total_supply\` decimal(30,6) NOT NULL`,
    );
  }
}
