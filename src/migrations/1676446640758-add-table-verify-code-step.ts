import { MigrationInterface, QueryRunner } from 'typeorm';

export class addTableVerifyCodeStep1676446640758 implements MigrationInterface {
  name = 'addTableVerifyCodeStep1676446640758';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`verify_code_step\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`code_id\` int NOT NULL, \`contract_address\` varchar(255) NOT NULL, \`result\` enum ('Fail', 'In-progress', 'Success', 'Pending') NOT NULL DEFAULT 'Pending', \`check_id\` int NOT NULL, \`msg_code\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_fa458264239bcc7e86f4acbd78\` (\`contract_address\`, \`check_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_fa458264239bcc7e86f4acbd78\` ON \`verify_code_step\``,
    );
    await queryRunner.query(`DROP TABLE \`verify_code_step\``);
  }
}
