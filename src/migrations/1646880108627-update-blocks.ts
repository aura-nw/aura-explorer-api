import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateBlocks1646880108627 implements MigrationInterface {
  name = 'updateBlocks1646880108627';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`blocks\` ADD \`gas_used\` int NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`blocks\` ADD \`gas_wanted\` int NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`blocks\` ADD \`round\` int NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`blocks\` DROP COLUMN \`round\``);
    await queryRunner.query(
      `ALTER TABLE \`blocks\` DROP COLUMN \`gas_wanted\``,
    );
    await queryRunner.query(`ALTER TABLE \`blocks\` DROP COLUMN \`gas_used\``);
  }
}
