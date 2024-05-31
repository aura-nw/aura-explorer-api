import { MigrationInterface, QueryRunner } from 'typeorm';

export class addOverviewInfoAsset1717123103158 implements MigrationInterface {
  name = 'addOverviewInfoAsset1717123103158';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`asset\` ADD \`overview_info\` text NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`asset\` DROP COLUMN \`overview_info\``,
    );
  }
}
