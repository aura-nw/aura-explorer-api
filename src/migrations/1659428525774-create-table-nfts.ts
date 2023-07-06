import { MigrationInterface, QueryRunner } from 'typeorm';

export class createTableNfts1659428525774 implements MigrationInterface {
  name = 'createTableNfts1659428525774';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`nfts\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`contract_address\` varchar(255) NOT NULL, \`token_id\` varchar(255) NOT NULL, \`owner\` varchar(255) NOT NULL, \`uri\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_e69162f25cf34602b5cbedfb01\` (\`contract_address\`, \`token_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`nfts\``);
  }
}
