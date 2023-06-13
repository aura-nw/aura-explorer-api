import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateTransactionsWithBlockIdNull1652233882065
  implements MigrationInterface
{
  name = 'updateTransactionsWithBlockIdNull1652233882065';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE transactions t SET t.created_at = t.created_at, t.updated_at = t.updated_at,
                t.blockId = (SELECT id FROM blocks WHERE height = t.height)
            WHERE t.blockId IS NULL`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
