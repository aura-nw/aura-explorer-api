import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateColumnTypeTableSmartContractCodes1664330919160
  implements MigrationInterface
{
  name = 'updateColumnTypeTableSmartContractCodes1664330919160';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`smart_contract_codes\` CHANGE \`type\` \`type\` VARCHAR(255) NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contract_codes\` CHANGE \`result\` \`result\` VARCHAR(255) NOT NULL DEFAULT ''`,
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
