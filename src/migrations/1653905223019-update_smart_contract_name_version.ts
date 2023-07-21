import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateSmartContractNameVersion1653905223019
  implements MigrationInterface
{
  name = 'updateSmartContractNameVersion1653905223019';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` ADD \`contract_name\` varchar(255) NOT NULL AFTER \`code_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` ADD \`compiler_version\` varchar(255) NOT NULL AFTER \`contract_verification\``,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` DROP COLUMN \`compiler_version\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` DROP COLUMN \`contract_name\``,
    );
  }
}
