import { MigrationInterface, QueryRunner } from 'typeorm';

export class migrateDataFromContractToContractCode1677556651246
  implements MigrationInterface
{
  name = 'migrateDataFromContractToContractCode1677556651246';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE \`smart_contract_codes\` AS \`scc\`
       INNER JOIN \`smart_contracts\` AS \`sc\` ON \`scc\`.\`code_id\` = \`sc\`.\`code_id\`
       SET \`scc\`.\`contract_verification\` = \`sc\`.\`contract_verification\`
        , \`scc\`.\`url\` = \`sc\`.\`url\`
        , \`scc\`.\`verified_at\` = \`sc\`.\`verified_at\`
        , \`scc\`.\`instantiate_msg_schema\` = \`sc\`.\`instantiate_msg_schema\`
        , \`scc\`.\`query_msg_schema\` = \`sc\`.\`query_msg_schema\`
        , \`scc\`.\`execute_msg_schema\` = \`sc\`.\`execute_msg_schema\`
        , \`scc\`.\`contract_hash\` = \`sc\`.\`contract_hash\`
        , \`scc\`.\`s3_location\` = \`sc\`.\`s3_location\`
      `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
