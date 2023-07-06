import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateTokenContract1654159681766 implements MigrationInterface {
  name = 'updateTokenContract1654159681766';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`token_contracts\` ADD \`symbol\` varchar(255) NOT NULL AFTER \`name\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`token_contracts\` ADD \`is_main_token\` tinyint NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`token_contracts\` DROP COLUMN \`is_main_token\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`token_contracts\` DROP COLUMN \`symbol\``,
    );
  }
}
