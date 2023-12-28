import { MigrationInterface, QueryRunner } from 'typeorm';

export class addOfficialSiteSocialProfilesInToTokenMarket1703232894156
  implements MigrationInterface
{
  name = 'addOfficialSiteSocialProfilesInToTokenMarket1703232894156';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`token_markets\` ADD \`official_site\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`token_markets\` ADD \`social_profiles\` json NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`token_markets\` DROP COLUMN \`social_profiles\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`token_markets\` DROP COLUMN \`official_site\``,
    );
  }
}
