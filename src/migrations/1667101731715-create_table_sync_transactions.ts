import { MigrationInterface, QueryRunner } from 'typeorm';

export class createTableSyncTransactions1667101731715
  implements MigrationInterface
{
  name = 'createTableSyncTransactions1667101731715';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`sync_transactions\` (
        \`created_at\` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`tx_hash\` VARCHAR(255) NOT NULL,
        \`type\` VARCHAR(255) NOT NULL,
        \`contract_address\` VARCHAR(255) NOT NULL DEFAULT '',
        \`from_address\` VARCHAR(255) NOT NULL DEFAULT '',
        \`to_address\` VARCHAR(255) NOT NULL DEFAULT '',
        \`amount\` DECIMAL(30, 6) NOT NULL DEFAULT '0',
        \`fee\` DECIMAL(30, 6) NOT NULL DEFAULT '0',
        \`timestamp\` DATETIME NOT NULL,
        INDEX \`idx_timestamp\` (\`timestamp\`),
        PRIMARY KEY (\`tx_hash\`)
      ) ENGINE=InnoDB
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`sync_transactions\``);
  }
}
