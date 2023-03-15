import { MigrationInterface, QueryRunner } from 'typeorm';

export class createTableQueueInfo1678785273426 implements MigrationInterface {
  name = 'createTableQueueInfo1678785273426';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`queue_info\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` bigint NOT NULL AUTO_INCREMENT, \`job_id\` int NULL, \`height\` int NULL, \`job_name\` varchar(255) NOT NULL, \`job_data\` text NOT NULL, \`status\` varchar(255) NOT NULL, \`processor\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`queue_info\``);
  }
}
