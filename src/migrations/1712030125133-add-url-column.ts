import { MigrationInterface, QueryRunner } from 'typeorm';

export class addUrlColumn1712030125133 implements MigrationInterface {
  name = 'addUrlColumn1712030125133';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`explorer\` ADD \`explorer_url\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(`SET SQL_SAFE_UPDATES = 0`);
    await queryRunner.query(
      `UPDATE explorer set explorer_url = 'https://euphoria.aurascan.io' where id = 1`,
    );
    await queryRunner.query(`SET SQL_SAFE_UPDATES = 1`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`explorer\` DROP COLUMN \`explorer_url\``,
    );
  }
}
