import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateSmartContractEntity1653365389001
  implements MigrationInterface
{
  name = 'updateSmartContractEntity1653365389001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` DROP COLUMN \`schema\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` ADD \`code_id\` int NOT NULL AFTER \`height\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` ADD \`contract_match\` varchar(255) AFTER \`url\``,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` DROP COLUMN \`contract_match\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` DROP COLUMN \`code_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` ADD \`schema\` text NOT NULL`,
    );
  }
}
