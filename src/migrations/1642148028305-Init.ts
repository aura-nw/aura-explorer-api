import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1642148028305 implements MigrationInterface {
  name = 'Init1642148028305';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`transactions\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`tx_hash\` varchar(255) NOT NULL, \`code\` int NOT NULL DEFAULT '0', \`codespace\` varchar(255) NOT NULL DEFAULT '', \`data\` varchar(255) NOT NULL DEFAULT '', \`gas_used\` int NOT NULL DEFAULT '0', \`gas_wanted\` int NOT NULL DEFAULT '0', \`height\` int NOT NULL, \`info\` varchar(255) NOT NULL DEFAULT '', \`type\` varchar(255) NOT NULL DEFAULT '', \`raw_log\` text NOT NULL, \`timestamp\` datetime NOT NULL, \`tx\` text NOT NULL, \`blockId\` int NULL, UNIQUE INDEX \`tx_hash\` (\`tx_hash\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`blocks\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`block_hash\` varchar(255) NOT NULL, \`chainid\` varchar(255) NOT NULL DEFAULT '', \`height\` int NOT NULL, \`identity\` varchar(255) NOT NULL DEFAULT '', \`moniker\` varchar(255) NOT NULL DEFAULT '', \`num_signatures\` int NOT NULL DEFAULT '0', \`num_txs\` int NOT NULL DEFAULT '0', \`operator_address\` varchar(255) NOT NULL DEFAULT '', \`proposer\` varchar(255) NOT NULL DEFAULT '', \`timestamp\` datetime NOT NULL, UNIQUE INDEX \`block_hash\` (\`block_hash\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`sync-status\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`current_block\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`transactions\` ADD CONSTRAINT \`FK_e11180855c1afd8fe21f96a1bf8\` FOREIGN KEY (\`blockId\`) REFERENCES \`blocks\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `INSERT INTO \`sync-status\` (\`current_block\`) VALUES (0)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`transactions\` DROP FOREIGN KEY \`FK_e11180855c1afd8fe21f96a1bf8\``,
    );
    await queryRunner.query(`DROP TABLE \`sync-status\``);
    await queryRunner.query(`DROP INDEX \`block_hash\` ON \`blocks\``);
    await queryRunner.query(`DROP TABLE \`blocks\``);
    await queryRunner.query(`DROP INDEX \`tx_hash\` ON \`transactions\``);
    await queryRunner.query(`DROP TABLE \`transactions\``);
  }
}
