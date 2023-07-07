import { MigrationInterface, QueryRunner } from 'typeorm';

export class addColumnTxHashToTableProposalDeposits1649927575787
  implements MigrationInterface
{
  name = 'addColumnTxHashToTableProposalDeposits1649927575787';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`proposal_deposits\` ADD \`tx_hash\` varchar(255) NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`proposal_deposits\` DROP COLUMN \`tx_hash\``,
    );
  }
}
