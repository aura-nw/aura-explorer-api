import { MigrationInterface, QueryRunner } from 'typeorm';

export class addColumnProposalIdToTableHistoryProposals1649919910446
  implements MigrationInterface
{
  name = 'addColumnProposalIdToTableHistoryProposals1649919910446';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`history_proposals\` ADD \`proposal_id\` int NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`history_proposals\` DROP COLUMN \`proposal_id\``,
    );
  }
}
