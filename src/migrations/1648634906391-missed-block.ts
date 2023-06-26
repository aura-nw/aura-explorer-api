import { MigrationInterface, QueryRunner } from 'typeorm';

export class missedBlock1648634906391 implements MigrationInterface {
  name = 'missedBlock1648634906391';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`missed-block\` (\`validator_address\` varchar(255) NOT NULL, \`height\` int NOT NULL, \`timestamp\` datetime NOT NULL, PRIMARY KEY (\`validator_address\`, \`height\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`missed-block\``);
  }
}
