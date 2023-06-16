import { MigrationInterface, QueryRunner } from 'typeorm';

export class addColumnHeightToTableTokenTransactions1662439367815
  implements MigrationInterface
{
  name = 'addColumnHeightToTableTokenTransactions1662439367815';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_f598c4ceae2fe2e7beb1c6e1f2\` ON \`token_transactions\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`token_transactions\` ADD \`height\` int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`token_transactions\` ADD INDEX \`token_transaction_idx_contract_address\` (\`contract_address\`)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`token_transactions\` DROP INDEX \`token_transaction_idx_contract_address\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`token_transactions\` DROP COLUMN \`height\``,
    );
  }
}
