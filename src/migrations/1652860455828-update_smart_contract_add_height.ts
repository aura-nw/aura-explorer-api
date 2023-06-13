import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateSmartContractAddHeight1652860455828
  implements MigrationInterface
{
  name = 'updateSmartContractAddHeight1652860455828';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` ADD \`height\` int NOT NULL AFTER \`id\``,
    );
    await queryRunner.query(
      `CREATE INDEX \`IDX_ContractAddress\` ON \`smart_contracts\` (\`contract_address\`);`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` DROP COLUMN \`height\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` DROP INDEX \`IDX_ContractAddress\`;`,
    );
  }
}
