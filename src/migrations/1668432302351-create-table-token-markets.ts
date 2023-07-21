import { MigrationInterface, QueryRunner } from 'typeorm';

export class createTableTokenMarkets1668432302351
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`token_contracts\``);
    await queryRunner.query(`DROP TABLE \`token_markets\``);
    await queryRunner.query(`CREATE TABLE \`token_markets\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT,   \`contract_address\` varchar(255) ,  \`coin_id\` varchar(255) NOT NULL,
        \`symbol\` varchar(255), \`name\` varchar(255), \`description\` text NULL,  \`image\` varchar(255), \`max_supply\` DECIMAL(38,6) NOT NULL DEFAULT 0.000000, \`current_price\` DECIMAL(38,6) NOT NULL DEFAULT 0.000000,
        \`price_change_percentage_24h\` FLOAT NOT NULL DEFAULT 0, \`total_volume\` DECIMAL(38,6) NOT NULL DEFAULT 0.000000,  \`circulating_supply\` DECIMAL(38,6) NOT NULL DEFAULT 0.000000,  \`circulating_market_cap\` DECIMAL(38,6) NOT NULL DEFAULT 0.000000,
         \`current_holder\` int NOT NULL DEFAULT 0, \`holder_change_percentage_24h\` FLOAT NOT NULL DEFAULT 0,  PRIMARY KEY (\`id\`))`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
