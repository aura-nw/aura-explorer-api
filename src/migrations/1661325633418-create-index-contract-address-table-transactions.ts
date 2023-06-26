import { MigrationInterface, QueryRunner } from 'typeorm';

export class createIndexContractAddressTableTransactions1661325633418
  implements MigrationInterface
{
  name = 'createIndexContractAddressTableTransactions1661325633418';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX \`transactions_idx_contract_address\` ON \`transactions\` (\`contract_address\`)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`transactions_idx_contract_address\` ON \`transactions\``,
    );
  }
}
