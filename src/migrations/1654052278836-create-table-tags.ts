import { MigrationInterface, QueryRunner } from 'typeorm';

export class createTableTags1654052278836 implements MigrationInterface {
  name = 'createTableTags1654052278836';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`tags\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`account_address\` varchar(255) NOT NULL, \`contract_address\` varchar(255) NOT NULL, \`tag\` varchar(35) NULL, \`note\` varchar(500) NULL, UNIQUE INDEX \`IDX_67afa205619f78463124b44380\` (\`account_address\`, \`contract_address\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`tags\``);
  }
}
