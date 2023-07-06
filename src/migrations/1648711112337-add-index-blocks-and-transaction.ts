import { MigrationInterface, QueryRunner } from 'typeorm';

export class addIndexBlocksAndTransaction1648711112337
  implements MigrationInterface
{
  name = 'addIndexBlocksAndTransaction1648711112337';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE INDEX `blocks_idx_height` ON `blocks` (`height`);',
    );
    await queryRunner.query(
      'CREATE INDEX `transactions_idx_height` ON `transactions` (`height`);',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX `blocks_idx_height` ON `blocks`;');
    await queryRunner.query(
      'DROP INDEX `transactions_idx_height` ON `transactions`;',
    );
  }
}
