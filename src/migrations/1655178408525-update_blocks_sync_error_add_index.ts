import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateBlocksSyncErrorAddIndex1655178408525
  implements MigrationInterface
{
  name = 'updateBlocksSyncErrorAddIndex1655178408525';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`block_sync_error\` ADD INDEX \`block_sync_error_idx_height\`(\`height\` ASC)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
