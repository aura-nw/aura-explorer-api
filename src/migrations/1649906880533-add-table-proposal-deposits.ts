import { MigrationInterface, QueryRunner } from 'typeorm';

export class addTableProposalDeposits1649906880533
  implements MigrationInterface
{
  name = 'addTableProposalDeposits1649906880533';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`proposal_deposits\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`proposal_id\` int NOT NULL, \`depositor\` varchar(255) NOT NULL, \`amount\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`proposal_deposits\``);
  }
}
