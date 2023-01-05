import { MigrationInterface, QueryRunner } from 'typeorm';

export class smartContractUpdateDataTypeDescriptionColumn1672720422414
  implements MigrationInterface
{
  name = 'smartContractUpdateDataTypeDescriptionColumn1672720422414';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` CHANGE COLUMN \`description\` \`description\` TEXT NULL DEFAULT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` CHANGE COLUMN \`description\` \`description\` VARCHAR(255) NULL DEFAULT NULL`,
    );
  }
}
