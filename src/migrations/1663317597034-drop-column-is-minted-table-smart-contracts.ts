import { MigrationInterface, QueryRunner } from 'typeorm';

export class dropColumnIsMintedTableSmartContracts1663317597034
  implements MigrationInterface
{
  name = 'dropColumnIsMintedTableSmartContracts1663317597034';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` DROP COLUMN \`is_minted\``,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` ADD \`is_minted\` tinyint NOT NULL DEFAULT '0'`,
    );
  }
}
