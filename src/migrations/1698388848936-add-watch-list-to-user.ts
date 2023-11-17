import { MigrationInterface, QueryRunner } from 'typeorm';

export class addWatchListToUser1698388848936 implements MigrationInterface {
  name = 'addWatchListToUser1698388848936';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`watch_list\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
      \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`address\` varchar(255) NOT NULL,
      \`type\` enum ('account', 'contract') NOT NULL,
      \`favorite\` tinyint NOT NULL DEFAULT 0,
      \`tracking\` tinyint NOT NULL DEFAULT 0,
      \`note\` varchar(200) NULL DEFAULT '',
      \`settings\` json NULL,
      \`user_id\` int NOT NULL,
      UNIQUE INDEX \`IDX_1ef4cbbd8b315a6f9a293d29cd\` (\`address\`, \`user_id\`),
      PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`watch_list\` ADD CONSTRAINT \`FK_115e7508781f89fccc1fb652db5\` FOREIGN KEY (\`user_id\`)
      REFERENCES \`user\`(\`id\`)
      ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`watch_list\` DROP FOREIGN KEY \`FK_115e7508781f89fccc1fb652db5\``,
    );

    await queryRunner.query(
      `DROP INDEX \`IDX_1ef4cbbd8b315a6f9a293d29cd\` ON \`watch_list\``,
    );
    await queryRunner.query(`DROP TABLE \`watch_list\``);
  }
}
