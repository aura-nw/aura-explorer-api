import { MigrationInterface, QueryRunner } from 'typeorm';

export class createTableSmartContractCodes1656297512210
  implements MigrationInterface
{
  name = 'createTableSmartContractCodes1656297512210';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`smart_contract_codes\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`code_id\` int NOT NULL, \`type\` enum ('CW20', 'CW721') NOT NULL, \`result\` varchar(255) NOT NULL, UNIQUE INDEX \`code_id\` (\`code_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`smart_contract_codes\``);
  }
}
