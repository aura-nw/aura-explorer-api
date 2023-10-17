import { MigrationInterface, QueryRunner } from 'typeorm';

export class addTableNotificationToken1697530496579
  implements MigrationInterface
{
  name = 'addTableNotificationToken1697530496579';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`notification_token\` (
            \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
            \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
            \`id\` int NOT NULL AUTO_INCREMENT, 
            \`notification_token\` varchar(255) NOT NULL,
            \`user_id\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`notification_token\``);
  }
}
