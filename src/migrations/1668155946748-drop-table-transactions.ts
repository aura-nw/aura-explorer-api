import { MigrationInterface, QueryRunner } from 'typeorm';

export class dropTableTransactions1668155946748 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`transactions\` RENAME TO \`transactions_bak\`;`,
    );
    // await queryRunner.query(`DROP TABLE \`transactions_bak\``);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
