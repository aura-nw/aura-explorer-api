import { MigrationInterface, QueryRunner } from 'typeorm';

export class renameTableHistoryProposals1649836130872
  implements MigrationInterface
{
  name = 'renameTableHistoryProposals1649836130872';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `history_proposal` RENAME TO `history_proposals`',
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
