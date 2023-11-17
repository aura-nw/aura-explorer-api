import { MigrationInterface, QueryRunner } from 'typeorm';

export class addTableNotifactionWatchList1698741231160
  implements MigrationInterface
{
  name = 'addTableNotifactionWatchList1698741231160';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`notification_token\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`notification_token\` varchar(255) NOT NULL, \`status\` varchar(255) NOT NULL DEFAULT 'ACTIVE', \`user_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`notification\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, \`body\` json NOT NULL, \`token\` varchar(255) NOT NULL, \`image\` varchar(255) NULL, \`tx_hash\` varchar(255) NOT NULL, \`type\` varchar(255) NOT NULL, \`user_id\` int NOT NULL, \`is_read\` tinyint NOT NULL DEFAULT 0, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`notification_token\` ADD CONSTRAINT \`FK_9946abba87be50041606b8c5646\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`notification_token\` DROP FOREIGN KEY \`FK_9946abba87be50041606b8c5646\``,
    );
    await queryRunner.query(`DROP TABLE \`notification\``);
    await queryRunner.query(`DROP TABLE \`notification_token\``);
  }
}
