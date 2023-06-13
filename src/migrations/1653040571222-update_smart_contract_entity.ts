import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateSmartContractEntity1653040571222
  implements MigrationInterface
{
  name = 'updateSmartContractEntity1653040571222';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` ADD \`contract_hash\` varchar(255) NOT NULL AFTER \`creator_address\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` ADD \`is_exact_match\` tinyint NOT NULL AFTER \`url\``,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` DROP COLUMN \`is_exact_match\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` DROP COLUMN \`contract_hash\``,
    );
  }
}
