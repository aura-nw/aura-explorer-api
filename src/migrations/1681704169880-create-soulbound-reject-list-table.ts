import { MigrationInterface, QueryRunner } from 'typeorm';

export class createSoulboundRejectListTable1681704169880
  implements MigrationInterface
{
  name = 'createSoulboundRejectListTable1681704169880';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`soulbound_reject_list\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`account_address\` varchar(255) NOT NULL, \`reject_address\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`soulbound_reject_list\``);
  }
}
