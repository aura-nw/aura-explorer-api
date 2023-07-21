import { MigrationInterface, QueryRunner } from 'typeorm';

export class deleteUniqueIndexDelegatorRewards1653286772136
  implements MigrationInterface
{
  name = 'deleteUniqueIndexDelegatorRewards1653286772136';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX \`tx_hash\` ON \`delegator_rewards\``);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
