import { MigrationInterface, QueryRunner } from 'typeorm';

export class createColumnVotingPowerLevel1681266400447
  implements MigrationInterface
{
  name = 'createColumnVotingPowerLevel1681266400447';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`validators\` ADD \`voting_power_level\` varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`validators\` DROP COLUMN \`voting_power_level\``,
    );
  }
}
