import { MigrationInterface, QueryRunner } from 'typeorm';

export class changeTableName1649386890128 implements MigrationInterface {
  name = 'changeTableName1649386890128';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `proposal-votes` RENAME TO `proposal_votes`',
    );
    await queryRunner.query(
      'ALTER TABLE `missed-block` RENAME TO `missed_block`',
    );
    await queryRunner.query(
      'ALTER TABLE `sync-status` RENAME TO `sync_status`',
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
