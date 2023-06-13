import { MigrationInterface, QueryRunner } from 'typeorm';

export class addHistoryProposal1649152952669 implements MigrationInterface {
  name = 'addHistoryProposal1649152952669';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE history_proposal (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`tx_hash\` varchar(255) NOT NULL, \`title\` varchar(255) NOT NULL, \`description\` varchar(255) NOT NULL, \`recipient\` varchar(255) NOT NULL, \`amount\` varchar(255) NOT NULL, \`initial_deposit\` int NOT NULL, \`proposer\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE history_proposal`);
  }
}
