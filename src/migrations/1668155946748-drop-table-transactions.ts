import { MigrationInterface, QueryRunner } from 'typeorm';

export class dropTableTransactions1668155946748 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`transactions\` RENAME TO \`transactions_bak\`;`,
    );
    // await queryRunner.query(`DROP TABLE \`transactions_bak\``);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
