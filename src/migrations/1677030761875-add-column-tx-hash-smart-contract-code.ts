import { MigrationInterface, QueryRunner } from 'typeorm';

export class addColumnTxHashSmartContractCode1677030761875
  implements MigrationInterface
{
  name = 'addColumnTxHashSmartContractCode1677030761875';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`smart_contract_codes\` ADD \`tx_hash\` varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`smart_contract_codes\` DROP COLUMN \`tx_hash\``,
    );
  }
}
