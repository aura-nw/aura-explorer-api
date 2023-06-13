import { MigrationInterface, QueryRunner } from 'typeorm';

export class addTokenContract1654141992727 implements MigrationInterface {
  name = 'addTokenContract1654141992727';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`token_contracts\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`image\` varchar(255), \`description\` varchar(255), \`contract_address\` varchar(255) NOT NULL, \`decimal\` int NOT NULL, \`max_total_supply\` int, UNIQUE INDEX \`contract_address\` (\`contract_address\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` ADD \`instantiate_msg_schema\` varchar(255) AFTER \`url\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` ADD \`query_msg_schema\` varchar(255) AFTER \`instantiate_msg_schema\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` ADD \`execute_msg_schema\` varchar(255) AFTER \`query_msg_schema\``,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` DROP COLUMN \`execute_msg_schema\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` DROP COLUMN \`query_msg_schema\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` DROP COLUMN \`instantiate_msg_schema\``,
    );
    await queryRunner.query(`DROP TABLE \`token_contracts\``);
  }
}
