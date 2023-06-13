import { MigrationInterface, QueryRunner } from 'typeorm';

export class changeDataTypeColumns1659430248062 implements MigrationInterface {
  name = 'changeDataTypeColumns1659430248062';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`transactions\` CHANGE \`data\` \`data\` text CHARACTER SET 'utf8mb4' COLLATE 'utf8mb4_bin' NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`transactions\` CHANGE \`raw_log_data\` \`raw_log_data\` text CHARACTER SET 'utf8mb4' COLLATE 'utf8mb4_bin' NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`validators\` CHANGE \`details\` \`details\` text CHARACTER SET 'utf8mb4' COLLATE 'utf8mb4_bin' NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`history_proposals\` CHANGE \`description\` \`description\` text CHARACTER SET 'utf8mb4' COLLATE 'utf8mb4_bin' NULL`,
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
