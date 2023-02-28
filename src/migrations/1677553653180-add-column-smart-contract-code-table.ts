import { MigrationInterface, QueryRunner } from 'typeorm';

export class addColumnSmartContractCodeTable1677553653180
  implements MigrationInterface
{
  name = 'addColumnSmartContractCodeTable1677553653180';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`smart_contract_codes\` ADD \`contract_verification\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contract_codes\` ADD \`compiler_version\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contract_codes\` ADD \`url\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contract_codes\` ADD \`verified_at\` timestamp NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`smart_contract_codes\` DROP COLUMN \`verified_at\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contract_codes\` DROP COLUMN \`url\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contract_codes\` DROP COLUMN \`compiler_version\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contract_codes\` DROP COLUMN \`contract_verification\``,
    );
  }
}
