import { MigrationInterface, QueryRunner } from 'typeorm';

export class dropCoinIdTableSmartContracts1669354408384
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` DROP COLUMN \`coin_id\``,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
