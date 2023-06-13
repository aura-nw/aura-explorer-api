import { MigrationInterface, QueryRunner } from 'typeorm';

export class addColumnCoinIdToTableTokenContracts1660718215866
  implements MigrationInterface
{
  name = 'addColumnCoinIdToTableTokenContracts1660718215866';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`token_contracts\` ADD \`coin_id\` varchar(255) NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`token_contracts\` DROP COLUMN \`coin_id\``,
    );
  }
}
