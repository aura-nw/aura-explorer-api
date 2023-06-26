import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateSmartContractsReferences1660622451412
  implements MigrationInterface
{
  name = 'updateSmartContractsReferences1660622451412';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` ADD \`contract_references\` varchar(255) NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` DROP COLUMN \`contract_references\``,
    );
  }
}
