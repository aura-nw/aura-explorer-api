import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateTokenInfoTableSmartContracts1662541463685
  implements MigrationInterface
{
  name = 'updateTokenInfoTableSmartContracts1662541463685';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` ADD \`token_name\` VARCHAR(255) NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` ADD \`token_symbol\` VARCHAR(255) NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` ADD \`num_tokens\` BIGINT NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` ADD \`is_minted\` tinyint NOT NULL DEFAULT 0`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` DROP COLUMN \`is_minted\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` DROP COLUMN \`num_tokens\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` DROP COLUMN \`token_symbol\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` DROP COLUMN \`token_name\``,
    );
  }
}
