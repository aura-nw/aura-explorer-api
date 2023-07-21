import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateContractVerifyColumn1653277327102
  implements MigrationInterface
{
  name = 'updateContractVerifyColumn1653277327102';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` DROP COLUMN \`is_exact_match\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` ADD \`contract_verification\` varchar(255) NOT NULL AFTER \`url\``,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` DROP COLUMN \`contract_verification\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` ADD \`is_exact_match\` tinyint NOT NULL`,
    );
  }
}
