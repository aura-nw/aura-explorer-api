import { MigrationInterface, QueryRunner } from 'typeorm';

export class createTableTokenMarkets1667475068578
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE \`token_markets\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`contract_address\` varchar(255) ,  \`coin_id\` varchar(255) NOT NULL,
        \`symbol\` varchar(255), \`name\` varchar(255), \`description\` text NULL,  \`image\` varchar(255), \`max_supply\` int NOT NULL DEFAULT 0, \`current_price\` DECIMAL(30,6) NOT NULL DEFAULT 0.000000,
        \`price_change_percentage_24h\` DECIMAL(30,6) NOT NULL DEFAULT 0.000000, \`total_volume\` bigint NOT NULL DEFAULT 0,  \`circulating_supply\` int NOT NULL DEFAULT 0,
         \`current_holder\` int NOT NULL DEFAULT 0, \`holder_change_percentage_24h\` FLOAT NOT NULL DEFAULT 0,  PRIMARY KEY (\`contract_address\`, \`coin_id\`))`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
