import { MigrationInterface, QueryRunner } from 'typeorm';

export class createTableQueueInfo1678779010743 implements MigrationInterface {
  name = 'createTableQueueInfo1678779010743';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`queue_info\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` bigint NOT NULL AUTO_INCREMENT, \`height\` int NOT NULL, \`type\` varchar(255) NOT NULL, \`job_data\` text NOT NULL, \`status\` tinyint NOT NULL, \`group\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`queue_info\``);
  }
}
