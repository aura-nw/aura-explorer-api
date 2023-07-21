import { MigrationInterface, QueryRunner } from 'typeorm';

export class createTableCw20TokenOwners1660203696058
  implements MigrationInterface
{
  name = 'createTableCw20TokenOwners1660203696058';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`cw20_token_owners\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`contract_address\` varchar(255) NOT NULL, \`owner\` varchar(255) NOT NULL, \`balance\` DECIMAL(30,6) NOT NULL DEFAULT '0.00000000', \`percent_hold\` FLOAT NOT NULL, UNIQUE INDEX \`IDX_f6f5848559b7eb399b101feae3\` (\`contract_address\`, \`owner\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`cw20_token_owners\``);
  }
}
