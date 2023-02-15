import { MigrationInterface, QueryRunner } from 'typeorm';

export class addTableVerifyItemCheck1676446936888
  implements MigrationInterface
{
  name = 'addTableVerifyItemCheck1676446936888';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`verify_item_check\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`group_stage\` int NOT NULL, \`check_name\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `INSERT INTO \`verify_item_check\` (\`id\`, \`check_name\`, \`group_stage\`) VALUES ('1', 'Compiler image format', '1');`,
    );
    await queryRunner.query(
      `INSERT INTO \`verify_item_check\` (\`id\`, \`check_name\`, \`group_stage\`) VALUES ('2', 'Code ID valid', '1');`,
    );
    await queryRunner.query(
      `INSERT INTO \`verify_item_check\` (\`id\`, \`check_name\`, \`group_stage\`) VALUES ('3', 'Code ID verification session valid', '1');`,
    );
    await queryRunner.query(
      `INSERT INTO \`verify_item_check\` (\`id\`, \`check_name\`, \`group_stage\`) VALUES ('4', 'Get Code ID data hash', '1');`,
    );
    await queryRunner.query(
      `INSERT INTO \`verify_item_check\` (\`id\`, \`check_name\`, \`group_stage\`) VALUES ('5', 'Get source code', '2');`,
    );
    await queryRunner.query(
      `INSERT INTO \`verify_item_check\` (\`id\`, \`check_name\`, \`group_stage\`) VALUES ('6', 'Compile source code', '2');`,
    );
    await queryRunner.query(
      `INSERT INTO \`verify_item_check\` (\`id\`, \`check_name\`, \`group_stage\`) VALUES ('7', 'Compare data hash', '2');`,
    );
    await queryRunner.query(
      `INSERT INTO \`verify_item_check\` (\`id\`, \`check_name\`, \`group_stage\`) VALUES ('8', 'Internal process', '2');`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`verify_item_check\``);
  }
}
