import { MigrationInterface, QueryRunner } from 'typeorm';

export class addVerifyCw20Column1687417991360 implements MigrationInterface {
  name = 'addVerifyCw20Column1687417991360';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`token_markets\` ADD \`verify_status\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`token_markets\` ADD \`verify_text\` text NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`token_markets\` DROP COLUMN \`verify_text\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`token_markets\` DROP COLUMN \`verify_status\``,
    );
  }
}
