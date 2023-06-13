import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateSmartContractMainnetReferences1660790418171
  implements MigrationInterface
{
  name = 'updateSmartContractMainnetReferences1660790418171';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` DROP COLUMN \`contract_references\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` ADD \`mainnet_code_id\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` ADD \`mainnet_upload_status\` varchar(255) NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` DROP COLUMN \`mainnet_upload_status\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` DROP COLUMN \`mainnet_code_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` ADD \`contract_references\` varchar(255) NOT NULL`,
    );
  }
}
