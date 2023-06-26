import { MigrationInterface, QueryRunner } from 'typeorm';

export class changeDataTypeProposals1657764405880
  implements MigrationInterface
{
  name = 'changeDataTypeProposals1657764405880';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`proposals\` CHANGE COLUMN \`pro_turnout\` \`pro_turnout\` DECIMAL(30,6) NOT NULL DEFAULT '0.00000000'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`proposals\` CHANGE COLUMN \`pro_votes_yes\` \`pro_votes_yes\` DECIMAL(30,6) NOT NULL DEFAULT '0.00000000'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`proposals\` CHANGE COLUMN \`pro_votes_abstain\` \`pro_votes_abstain\` DECIMAL(30,6) NOT NULL DEFAULT '0.00000000'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`proposals\` CHANGE COLUMN \`pro_votes_no\` \`pro_votes_no\` DECIMAL(30,6) NOT NULL DEFAULT '0.00000000'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`proposals\` CHANGE COLUMN \`pro_votes_no_with_veto\` \`pro_votes_no_with_veto\` DECIMAL(30,6) NOT NULL DEFAULT '0.00000000'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`proposals\` CHANGE COLUMN \`pro_total_deposits\` \`pro_total_deposits\` DECIMAL(30,6) NOT NULL DEFAULT '0.00000000'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`proposals\` CHANGE COLUMN \`pro_participation_rate\` \`pro_participation_rate\` DECIMAL(30,6) NOT NULL DEFAULT '0.00000000'`,
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
