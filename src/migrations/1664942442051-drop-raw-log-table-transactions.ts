import { MigrationInterface, QueryRunner } from 'typeorm';

export class dropRawLogTableTransactions1664942442051
  implements MigrationInterface
{
  name = 'dropRawLogTableTransactions1664942442051';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`transactions\` DROP COLUMN \`raw_log\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`transactions\` DROP COLUMN \`raw_log_data\``,
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
