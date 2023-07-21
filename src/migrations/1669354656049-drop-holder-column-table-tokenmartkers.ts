import { MigrationInterface, QueryRunner } from 'typeorm';

export class dropHolderColumnTableTokenmartkers1669354656049
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`token_markets\` DROP COLUMN \`current_holder\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`token_markets\` DROP COLUMN \`holder_change_percentage_24h\``,
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
