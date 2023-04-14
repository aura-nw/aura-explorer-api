import { MigrationInterface, QueryRunner } from 'typeorm';

export class createSoulboundWhiteListTable1681444813471
  implements MigrationInterface
{
  name = 'createSoulboundWhiteListTable1681444813471';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`soulbound-white-list\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`account_address\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_a126fe2d41ab919b3527527229\` (\`account_address\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_a126fe2d41ab919b3527527229\` ON \`soulbound-white-list\``,
    );
    await queryRunner.query(`DROP TABLE \`soulbound-white-list\``);
  }
}
