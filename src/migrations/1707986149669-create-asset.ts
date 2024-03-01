import { MigrationInterface, QueryRunner } from 'typeorm';

export class createAsset1707986149669 implements MigrationInterface {
  name = 'createAsset1707986149669';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`asset\` (
				\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
				\`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
				\`id\` int NOT NULL AUTO_INCREMENT,
				\`coin_id\` varchar(255) NOT NULL,
				\`symbol\` varchar(255) NOT NULL,
				\`name\` varchar(255) NOT NULL,
				\`image\` varchar(255) NOT NULL,
				\`current_price\` decimal(38,6) NOT NULL DEFAULT '0.000000',
				\`price_change_percentage_24h\` float NOT NULL DEFAULT '0',
				\`verify_status\` varchar(255) NULL,
				\`verify_text\` varchar(255) NULL,
				\`denom\` varchar(255) NULL,
				\`decimal\` int NOT NULL DEFAULT '0',
				\`chain_id\` varchar(255) NULL,
				\`official_site\` varchar(255) NULL,
				\`social_profiles\` json NULL,
				\`type\` varchar(255) NULL,
				\`total_supply\` decimal(38,6) NOT NULL DEFAULT '0.000000',
				\`explorer_id\` int NULL,
        PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`token_holder_statistic\` ADD \`asset_id\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`token_holder_statistic\` ADD CONSTRAINT \`FK_80e607266e3b43a73180d3b8d6a\` FOREIGN KEY (\`asset_id\`) REFERENCES \`asset\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`asset\` ADD CONSTRAINT \`FK_9c2512328742026fd8d7e37da9c\` FOREIGN KEY (\`explorer_id\`) REFERENCES \`explorer\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`IDX_caab7846c80a2a9f5ed9d515d8\` ON \`asset\` (\`denom\`, \`explorer_id\`)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`asset\` DROP FOREIGN KEY \`FK_9c2512328742026fd8d7e37da9c\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`token_holder_statistic\` DROP COLUMN \`asset_id\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_9075b096ce124cae87af8abff7\` ON \`asset\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_caab7846c80a2a9f5ed9d515d8\` ON \`asset\``,
    );
    await queryRunner.query(`DROP TABLE \`asset\``);
  }
}
