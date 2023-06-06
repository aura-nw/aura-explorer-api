import { MigrationInterface, QueryRunner } from 'typeorm';

export class createMigrationAdminNameTag1685436333973
  implements MigrationInterface
{
  name = 'createMigrationAdminNameTag1685436333973';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`name_tag\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`type\` varchar(255) NOT NULL, \`name_tag\` varchar(255) CHARACTER SET 'utf8' COLLATE 'utf8_bin' NOT NULL, \`address\` varchar(255) NOT NULL, \`updated_by\` int NOT NULL, \`deleted_at\` timestamp NULL, UNIQUE INDEX \`IDX_bdf80a3b3305f61f4450d8a4c9\` (\`address\`), UNIQUE INDEX \`IDX_48232194001651d584dbff792d\` (\`name_tag\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`user\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`email\` varchar(255) NOT NULL, \`name\` varchar(255) NULL, \`role\` varchar(255) NULL, \`provider\` varchar(255) NULL, UNIQUE INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`name_tag\` ADD CONSTRAINT \`FK_xttt5ak2duc449574450s212er\` FOREIGN KEY (updated_by) REFERENCES user(id)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`name_tag\` DROP FOREIGN KEY \`FK_xttt5ak2duc449574450s212er\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` ON \`user\``,
    );
    await queryRunner.query(`DROP TABLE \`user\``);
    await queryRunner.query(`DROP TABLE \`refresh_token\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_48232194001651d584dbff792d\` ON \`name_tag\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_bdf80a3b3305f61f4450d8a4c9\` ON \`name_tag\``,
    );
    await queryRunner.query(`DROP TABLE \`name_tag\``);
  }
}
