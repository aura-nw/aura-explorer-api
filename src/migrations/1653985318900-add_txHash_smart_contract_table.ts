import { MigrationInterface, QueryRunner } from 'typeorm';

export class addTxHashSmartContractTable1653985318900
  implements MigrationInterface
{
  name = 'addTxHashSmartContractTable1653985318900';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` ADD \`tx_hash\` varchar(255) NOT NULL AFTER \`contract_hash\``,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` DROP COLUMN \`tx_hash\``,
    );
  }
}
