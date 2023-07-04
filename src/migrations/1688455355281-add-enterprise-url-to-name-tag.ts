import { MigrationInterface, QueryRunner } from 'typeorm';

export class addEnterpriseUrlToNameTag1688455355281
  implements MigrationInterface
{
  name = 'addEnterpriseUrlToNameTag1688455355281';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`name_tag\` ADD \`enterprise_url\` varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`name_tag\` DROP COLUMN \`enterprise_url\``,
    );
  }
}
