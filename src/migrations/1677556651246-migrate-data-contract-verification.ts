import { MigrationInterface, QueryRunner } from 'typeorm';

export class migrateDataContractVerification1677556651246
  implements MigrationInterface
{
  name = 'migrateDataContractVerification1677556651246';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE \`smart_contract_codes\` AS \`scc\`
       SET \`scc\`.\`contract_verification\` = 'VERIFIED'
       WHERE \`scc\`.\`contract_verification\` IN ('EXACT MATCH', 'SIMILAR MATCH');
      `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
