import { MigrationInterface, QueryRunner } from 'typeorm';

export class createTableTokenTransactions1661304838438
  implements MigrationInterface
{
  name = 'createTableTokenTransactions1661304838438';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`token_transactions\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`tx_hash\` varchar(255) NOT NULL, \`contract_address\` varchar(255) NOT NULL, \`token_id\` varchar(255) NOT NULL, \`transaction_type\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_f598c4ceae2fe2e7beb1c6e1f2\` (\`tx_hash\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`token_transactions\``);
  }
}
