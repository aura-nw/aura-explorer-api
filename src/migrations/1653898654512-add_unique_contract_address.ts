import { MigrationInterface, QueryRunner } from 'typeorm';

export class addUniqueContractAddress1653898654512
  implements MigrationInterface
{
  name = 'addUniqueContractAddress1653898654512';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_ContractAddress\` ON \`smart_contracts\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` ADD UNIQUE (\`contract_address\`)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX \`IDX_ContractAddress\` ON \`smart_contracts\` (\`contract_address\`)`,
    );
  }
}
