import { MigrationInterface, QueryRunner } from 'typeorm';

export class addTokenHolderStatistic1704701919692
  implements MigrationInterface
{
  name = 'addTokenHolderStatistic1704701919692';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`token_holder_statistic\` (
        \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`total_holder\` int NULL,
        \`token_market_id\` int NULL,
        PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`token_holder_statistic\` ADD CONSTRAINT \`FK_2e0e6ab8525ef2a0ec953583ac5\`
      FOREIGN KEY (\`token_market_id\`) REFERENCES \`token_markets\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`token_holder_statistic\` DROP FOREIGN KEY \`FK_2e0e6ab8525ef2a0ec953583ac5\``,
    );
    await queryRunner.query(`DROP TABLE \`token_holder_statistic\``);
  }
}
