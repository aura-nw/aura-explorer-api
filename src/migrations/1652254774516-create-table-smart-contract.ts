import { MigrationInterface, QueryRunner } from 'typeorm';

export class createTableSmartContract1652254774516
  implements MigrationInterface
{
  name = 'createTableSmartContract1652254774516';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`smart_contracts\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`contract_address\` varchar(255) NOT NULL, \`creator_address\` varchar(255) NOT NULL, \`schema\` text NOT NULL, \`url\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`smart_contracts\``);
  }
}
