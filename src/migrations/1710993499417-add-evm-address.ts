import { MigrationInterface, QueryRunner } from 'typeorm';

export class addEvmAddress1710993499417 implements MigrationInterface {
  name = 'addEvmAddress1710993499417';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`public_name_tag\` ADD \`evm_address\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`private_name_tag\` ADD \`evm_address\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`watch_list\` ADD \`evm_address\` varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`watch_list\` DROP COLUMN \`evm_address\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`private_name_tag\` DROP COLUMN \`evm_address\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`public_name_tag\` DROP COLUMN \`evm_address\``,
    );
  }
}
