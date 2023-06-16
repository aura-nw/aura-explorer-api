import { MigrationInterface, QueryRunner } from 'typeorm';

export class addMessages1646732800539 implements MigrationInterface {
  name = 'addMessages1646732800539';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`transactions\` ADD \`messages\` json NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`transactions\` DROP COLUMN \`tx\``);
    await queryRunner.query(
      `ALTER TABLE \`transactions\` ADD \`tx\` json NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`transactions\` DROP COLUMN \`messages\``,
    );
    await queryRunner.query(`ALTER TABLE \`transactions\` DROP COLUMN \`tx\``);
    await queryRunner.query(
      `ALTER TABLE \`transactions\` ADD \`tx\` text NOT NULL`,
    );
  }
}
