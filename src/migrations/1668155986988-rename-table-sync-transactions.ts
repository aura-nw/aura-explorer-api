import { MigrationInterface, QueryRunner } from 'typeorm';

export class renameTableSyncTransactions1668155986988
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`sync_transactions\` RENAME TO \`transactions\`;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`transactions\` RENAME TO \`sync_transactions\`;`,
    );
  }
}
