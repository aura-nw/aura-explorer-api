import { MigrationInterface, QueryRunner } from 'typeorm';

export class addColumnContractInfoSmartContractCodeTable1677556651246
  implements MigrationInterface
{
  name = 'addColumnContractInfoSmartContractCodeTable1677556651246';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`smart_contract_codes\` ADD \`instantiate_msg_schema\` text NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contract_codes\` ADD \`query_msg_schema\` text NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contract_codes\` ADD \`execute_msg_schema\` text NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contract_codes\` ADD \`contract_hash\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contract_codes\` ADD \`s3_location\` varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`smart_contract_codes\` DROP COLUMN \`s3_location\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contract_codes\` DROP COLUMN \`contract_hash\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contract_codes\` DROP COLUMN \`execute_msg_schema\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contract_codes\` DROP COLUMN \`query_msg_schema\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contract_codes\` DROP COLUMN \`instantiate_msg_schema\``,
    );
  }
}
