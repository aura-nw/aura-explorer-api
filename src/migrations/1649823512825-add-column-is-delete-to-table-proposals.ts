import { MigrationInterface, QueryRunner } from 'typeorm';

export class addColumnIsDeleteToTableProposals1649823512825
  implements MigrationInterface
{
  name = 'addColumnIsDeleteToTableProposals1649823512825';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`proposals\` (\`pro_id\` int NOT NULL AUTO_INCREMENT, \`pro_tx_hash\` varchar(255) NOT NULL, \`pro_proposer\` varchar(255) NOT NULL, \`pro_proposer_address\` varchar(255) NOT NULL, \`pro_type\` varchar(255) NOT NULL, \`pro_title\` varchar(255) NOT NULL, \`pro_description\` varchar(255) NULL, \`pro_status\` varchar(255) NULL, \`pro_votes_yes\` int NOT NULL DEFAULT '0', \`pro_votes_abstain\` int NOT NULL DEFAULT '0', \`pro_votes_no\` int NOT NULL DEFAULT '0', \`pro_votes_no_with_veto\` int NOT NULL, \`pro_submit_time\` datetime NOT NULL, \`pro_deposit_end_time\` datetime NOT NULL, \`pro_total_deposits\` int NOT NULL DEFAULT '0', \`pro_voting_start_time\` datetime NOT NULL DEFAULT '2000-01-01 00:00:00', \`pro_voting_end_time\` datetime NOT NULL DEFAULT '2000-01-01 00:00:00', \`pro_voters\` int NOT NULL DEFAULT '0', \`pro_participation_rate\` int NOT NULL DEFAULT '0', \`pro_turnout\` int NOT NULL DEFAULT '0', \`pro_activity\` json NOT NULL, PRIMARY KEY (\`pro_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`proposals\` ADD \`is_delete\` tinyint NOT NULL DEFAULT 0`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`proposals\` DROP COLUMN \`is_delete\``,
    );
    await queryRunner.query(`DROP TABLE \`proposals\``);
  }
}
