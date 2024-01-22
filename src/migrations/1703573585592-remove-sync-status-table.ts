import { MigrationInterface, QueryRunner } from 'typeorm';

export class removeSyncStatusTable1703573585592 implements MigrationInterface {
  name = 'removeSyncStatusTable1703573585592';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS \`sync_status\``);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // No action
  }
}
