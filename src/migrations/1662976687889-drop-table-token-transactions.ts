import { MigrationInterface, QueryRunner } from 'typeorm';

export class dropTableTokenTransactions1662976687889
  implements MigrationInterface
{
  name = 'dropTableTokenTransactions1662976687889';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`token_transactions\``);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
