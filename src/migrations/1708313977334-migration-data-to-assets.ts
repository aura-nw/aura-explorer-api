import { MigrationInterface, QueryRunner } from 'typeorm';

export class migrationDataToAssets1708313977334 implements MigrationInterface {
  name = 'migrationDataToAssets1708313977334';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        INSERT INTO \`asset\` (
            \`coin_id\`
            , \`symbol\`
            , \`name\`
            , \`image\`
            , \`current_price\`
            , \`price_change_percentage_24h\`
            , \`verify_status\`
            , \`verify_text\`
            , \`denom\`
            , \`decimal\`
            , \`chain_id\`
            , \`official_site\`
            , \`social_profiles\`
            , \`explorer_id\`
        )
        SELECT 
            tm.\`coin_id\`
            , tm.\`symbol\`
            , tm.\`name\`
            , tm.\`image\`
            , tm.\`current_price\`
            , tm.\`price_change_percentage_24h\`
            , tm.\`verify_status\`
            , tm.\`verify_text\`
            , CASE
                WHEN tm.\`denom\` IS NOT NULL THEN tm.\`denom\`
                ELSE tm.\`contract_address\`
            END AS \`denom\`
            , tm.\`decimal\`
            , tm.\`chain_id\`
            , tm.\`official_site\`
            , tm.\`social_profiles\`
            , tm.\`explorer_id\`
        FROM 
           \`token_markets\` \`tm\`
        WHERE 
            tm.\`coin_id\` <> ''
    `);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
