import { MigrationInterface, QueryRunner } from 'typeorm';

export class changeDataTypeIdTableBlockSyncError1670922214897
  implements MigrationInterface
{
  name = 'changeDataTypeIdTableBlockSyncError1670922214897';
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`block_sync_error\` DROP COLUMN \`block_hash\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`block_sync_error\` CHANGE COLUMN \`id\` \`id\` BIGINT NOT NULL AUTO_INCREMENT`,
    );
    await queryRunner.query(
      `ALTER TABLE \`block_sync_error\` ADD UNIQUE INDEX \`IDX_9be3ae38e660bae3059ad19e48\` (\`height\`)`,
    );
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`block_sync_error\` DROP INDEX \`IDX_9be3ae38e660bae3059ad19e48\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`block_sync_error\` CHANGE COLUMN \`id\` \`id\` INT NOT NULL AUTO_INCREMENT`,
    );
    await queryRunner.query(
      `ALTER TABLE \`block_sync_error\` ADD \`block_hash\` varchar(255) CHARACTER SET "utf8mb4" COLLATE "utf8mb4_bin" NOT NULL`,
    );
  }
}
