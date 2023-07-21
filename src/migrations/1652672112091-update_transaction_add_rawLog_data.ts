import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateTransactionAddRawLogData1652672112091
  implements MigrationInterface
{
  name = 'updateTransactionAddRawLogData1652672112091';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`transactions\` ADD \`raw_log_data\` text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`transactions\` DROP COLUMN \`raw_log_data\``,
    );
  }
}
