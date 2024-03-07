import { MigrationInterface, QueryRunner } from 'typeorm';

export class addCoinInfoToAsset1709173688516 implements MigrationInterface {
  name = 'addCoinInfoToAsset1709173688516';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`asset\` ADD \`total_volume\` decimal(38,6) NOT NULL DEFAULT '0.000000'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`asset\` ADD \`market_cap\` decimal(38,6) NOT NULL DEFAULT '0.000000'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`asset\` DROP COLUMN \`market_cap\``);
    await queryRunner.query(
      `ALTER TABLE \`asset\` DROP COLUMN \`total_volume\``,
    );
  }
}
