import { MigrationInterface, QueryRunner } from 'typeorm';

export class addColumnRequestAmountToTableProposals1659686341676
  implements MigrationInterface
{
  name = 'addColumnRequestAmountToTableProposals1659686341676';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`proposals\` ADD \`request_amount\` DECIMAL(30,6) NOT NULL DEFAULT '0.00000000'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`proposals\` DROP COLUMN \`request_amount\``,
    );
  }
}
