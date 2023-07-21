import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateSmartContractDataType1654584950293
  implements MigrationInterface
{
  name = 'updateSmartContractDataType1654584950293';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` MODIFY COLUMN \`instantiate_msg_schema\` text NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` MODIFY COLUMN \`query_msg_schema\` text NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` MODIFY COLUMN \`execute_msg_schema\` text NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` DROP COLUMN \`execute_msg_schema\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` ADD \`execute_msg_schema\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` DROP COLUMN \`query_msg_schema\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` ADD \`query_msg_schema\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` DROP COLUMN \`instantiate_msg_schema\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` ADD \`instantiate_msg_schema\` varchar(255) NULL`,
    );
  }
}
