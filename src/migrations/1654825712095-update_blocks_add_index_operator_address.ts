import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateBlocksAddIndexOperatorAddress1654825712095
  implements MigrationInterface
{
  name = 'updateBlocksAddIndexOperatorAddress1654825712095';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`blocks\` ADD INDEX \`blocks_idx_operator_address\` (\`operator_address\` ASC) VISIBLE`,
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
