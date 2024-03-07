import { MigrationInterface, QueryRunner } from 'typeorm';

export class removeExplorerFromAsset1708337885523
  implements MigrationInterface
{
  name = 'removeExplorerFromAsset1708337885523';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`asset\` DROP FOREIGN KEY \`FK_9c2512328742026fd8d7e37da9c\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_caab7846c80a2a9f5ed9d515d8\` ON \`asset\``,
    );
    await queryRunner.query(`ALTER TABLE \`asset\` DROP COLUMN \`chain_id\``);
    await queryRunner.query(
      `ALTER TABLE \`asset\` DROP COLUMN \`explorer_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`asset\` ADD UNIQUE INDEX \`IDX_dfaa8912e3a864dae14becfe74\` (\`denom\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`asset\` CHANGE \`coin_id\` \`coin_id\` varchar(255) NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE \`asset\` CHANGE \`symbol\` \`symbol\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`asset\` CHANGE \`name\` \`name\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`asset\` CHANGE \`image\` \`image\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`asset\` CHANGE \`current_price\` \`current_price\` decimal(38,6) NULL DEFAULT '0.000000'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`asset\` CHANGE \`price_change_percentage_24h\` \`price_change_percentage_24h\` float NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`asset\` CHANGE \`total_supply\` \`total_supply\` decimal(60,6) NULL DEFAULT '0.000000'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`asset\` CHANGE \`decimal\` \`decimal\` int NULL DEFAULT '0'`,
    );
  }

  public async down(): Promise<void> {
    //No action.
  }
}
