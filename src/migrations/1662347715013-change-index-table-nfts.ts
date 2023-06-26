import { MigrationInterface, QueryRunner } from 'typeorm';

export class changeIndexTableNfts1662347715013 implements MigrationInterface {
  name = 'changeIndexTableNfts1662347715013';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`nft_idx_contract_address_token_id_is_burn\` ON \`nfts\``,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`nft_idx_contract_address_token_id\` ON \`nfts\` (\`contract_address\`, \`token_id\`)`,
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
