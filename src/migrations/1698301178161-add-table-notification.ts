import { MigrationInterface, QueryRunner } from 'typeorm';

export class addTableNotification1698301178161 implements MigrationInterface {
  name = 'addTableNotification1698301178161';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`notification\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, \`body\` text NOT NULL, \`token\` varchar(255) NOT NULL, \`image\` varchar(255) NULL, \`tx_hash\` varchar(255) NOT NULL, \`type\` varchar(255) NOT NULL, \`user_id\` int NOT NULL, \`is_read\` tinyint NOT NULL DEFAULT 0, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`notification\``);
  }
}
