import { MigrationInterface, QueryRunner } from 'typeorm';

export class editContractTableAddProjectName1665564244005
  implements MigrationInterface
{
  name = 'editContractTableAddProjectName1665564244005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` DROP COLUMN \`official_project_website\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` DROP COLUMN \`official_project_email\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` DROP COLUMN \`whitepaper\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` DROP COLUMN \`github\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` DROP COLUMN \`telegram\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` DROP COLUMN \`wechat\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` DROP COLUMN \`linkedin\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` DROP COLUMN \`discord\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` DROP COLUMN \`medium\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` DROP COLUMN \`reddit\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` DROP COLUMN \`slack\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` DROP COLUMN \`facebook\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` DROP COLUMN \`twitter\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` DROP COLUMN \`bitcointalk\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` DROP COLUMN \`project_description\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` ADD \`request_id\` int NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` DROP COLUMN \`request_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` ADD \`project_description\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` ADD \`bitcointalk\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` ADD \`twitter\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` ADD \`facebook\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` ADD \`slack\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` ADD \`reddit\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` ADD \`medium\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` ADD \`discord\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` ADD \`linkedin\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` ADD \`wechat\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` ADD \`telegram\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` ADD \`github\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` ADD \`whitepaper\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` ADD \`official_project_email\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` ADD \`official_project_website\` text NULL`,
    );
  }
}
