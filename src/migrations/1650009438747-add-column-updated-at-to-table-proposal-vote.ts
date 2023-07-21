import { MigrationInterface, QueryRunner } from 'typeorm';

export class addColumnUpdatedAtToTableProposalVote1650009438747
  implements MigrationInterface
{
  name = 'addColumnUpdatedAtToTableProposalVote1650009438747';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`proposal_votes\` ADD \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`proposal_votes\` DROP COLUMN \`updated_at\``,
    );
  }
}
