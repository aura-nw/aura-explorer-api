import { MigrationInterface, QueryRunner } from 'typeorm';

export class addDateToTokenHolderStatistic1708939691028
  implements MigrationInterface
{
  name = 'addDateToTokenHolderStatistic1708939691028';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`token_holder_statistic\` ADD \`date\` date NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`asset_id_date\` ON \`token_holder_statistic\` (\`asset_id\`, \`date\`)`,
    );
    await queryRunner.query(`SET SQL_SAFE_UPDATES = 0`);
    await queryRunner.query(
      `UPDATE token_holder_statistic set date = created_at where date is null`,
    );
    await queryRunner.query(`SET SQL_SAFE_UPDATES = 1`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`asset_id_date\` ON \`token_holder_statistic\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`token_holder_statistic\` DROP COLUMN \`date\``,
    );
  }
}
