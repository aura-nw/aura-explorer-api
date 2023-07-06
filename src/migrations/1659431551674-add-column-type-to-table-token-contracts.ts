import { MigrationInterface, QueryRunner } from 'typeorm';

export class addColumnTypeToTableTokenContracts1659431551674
  implements MigrationInterface
{
  name = 'addColumnTypeToTableTokenContracts1659431551674';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`token_contracts\` ADD \`type\` enum ('CW20', 'CW721') NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`token_contracts\` DROP COLUMN \`type\``,
    );
  }
}
