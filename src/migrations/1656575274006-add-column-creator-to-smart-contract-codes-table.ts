import { MigrationInterface, QueryRunner } from 'typeorm';

export class addColumnCreatorToSmartContractCodesTable1656575274006
  implements MigrationInterface
{
  name = 'addColumnCreatorToSmartContractCodesTable1656575274006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`smart_contract_codes\` ADD \`creator\` varchar(255) NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`smart_contract_codes\` DROP COLUMN \`creator\``,
    );
  }
}
