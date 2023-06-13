import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateContractTableAddProjectDescription1665392684168
  implements MigrationInterface
{
  name = 'updateContractTableAddProjectDescription1665392684168';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` ADD \`project_description\` varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` DROP COLUMN \`project_description\``,
    );
  }
}
