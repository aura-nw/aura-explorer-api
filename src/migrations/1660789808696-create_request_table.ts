import { MigrationInterface, QueryRunner } from 'typeorm';

export class createRequestTable1660789808696 implements MigrationInterface {
  name = 'createRequestTable1660789808696';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`deployment_requests\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`contract_description\` varchar(255) NOT NULL, \`project_name\` varchar(255) NOT NULL, \`official_project_website\` varchar(255) NOT NULL, \`official_project_email\` varchar(255) NOT NULL, \`project_sector\` varchar(255) NOT NULL, \`whitepaper\` varchar(255) NOT NULL, \`github\` varchar(255) NOT NULL, \`telegram\` varchar(255) NOT NULL, \`discord\` varchar(255) NOT NULL, \`facebook\` varchar(255) NOT NULL, \`twitter\` varchar(255) NOT NULL, \`euphoria_code_id\` int NOT NULL, \`mainnet_code_id\` int NOT NULL, \`contract_hash\` varchar(255) NOT NULL, \`url\` varchar(255) NOT NULL, \`instantiate_msg_schema\` text NOT NULL, \`query_msg_schema\` text NOT NULL, \`execute_msg_schema\` text NOT NULL, \`compiler_version\` varchar(255) NOT NULL, \`status\` varchar(255) NOT NULL, \`reason\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`deployment_requests\``);
  }
}
