import { MigrationInterface, QueryRunner } from 'typeorm';

export class addProposalVotes1648695202051 implements MigrationInterface {
  name = 'addProposalVotes1648695202051';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`proposal-votes\` (\`id\` int NOT NULL AUTO_INCREMENT, \`proposal_id\` int NOT NULL, \`voter\` varchar(255) NOT NULL, \`tx_hash\` varchar(255) NOT NULL, \`option\` varchar(255) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`proposal-votes\``);
  }
}
