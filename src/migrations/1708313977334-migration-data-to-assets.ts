import { MigrationInterface, QueryRunner } from 'typeorm';

export class migrationDataToAssets1708313977334 implements MigrationInterface {
  name = 'migrationDataToAssets1708313977334';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        INSERT INTO \`asset\` (
            \`id\`
            , \`coin_id\`
            , \`symbol\`
            , \`name\`
            , \`image\`
            , \`current_price\`
            , \`price_change_percentage_24h\`
            , \`verify_status\`
            , \`verify_text\`
            , \`denom\`
            , \`decimal\`
            , \`official_site\`
            , \`social_profiles\`
        )
        SELECT 
            tm.\`id\`
            , tm.\`coin_id\`
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
            , tm.\`official_site\`
            , tm.\`social_profiles\`
        FROM 
          \`token_markets\` \`tm\`
        WHERE 
          tm.\`coin_id\` <> ''
          AND tm.\`coin_id\` <> 'bitcoin'
    `);

    await queryRunner.query(`
        UPDATE \`token_holder_statistic\`
        SET \`asset_id\` = \`token_market_id\`
        WHERE \`asset_id\` IS NULL
    `);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
