import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateDescripAndWebsiteColType1664354133200
  implements MigrationInterface
{
  name = 'updateDescripAndWebsiteColType1664354133200';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`deployment_requests\` MODIFY COLUMN \`contract_description\` text NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`deployment_requests\` MODIFY COLUMN \`official_project_website\` text NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`deployment_requests\` MODIFY COLUMN \`contract_description\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`deployment_requests\` MODIFY COLUMN \`official_project_website\` varchar(255) NULL`,
    );
  }
}
