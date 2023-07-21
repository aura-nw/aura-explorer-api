import { MigrationInterface, QueryRunner } from 'typeorm';

export class addColumnSenderAndAmountToTableTokenTransactions1661833066921
  implements MigrationInterface
{
  name = 'addColumnSenderAndAmountToTableTokenTransactions1661833066921';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`token_transactions\` ADD \`sender\` VARCHAR(255) NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE \`token_transactions\` ADD \`amount\` DECIMAL(30,6) NOT NULL DEFAULT '0.000000'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`token_transactions\` DROP COLUMN \`amount\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`token_transactions\` DROP COLUMN \`sender\``,
    );
  }
}
