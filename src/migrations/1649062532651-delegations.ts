import { MigrationInterface, QueryRunner } from 'typeorm';

export class delegations1649062532651 implements MigrationInterface {
  name = 'delegations1649062532651';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`delegations\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`delegator_address\` varchar(255) NOT NULL, \`validator_address\` varchar(255) NOT NULL DEFAULT '', \`shares\` varchar(255) NOT NULL DEFAULT '', \`amount\` float NOT NULL, UNIQUE INDEX \`delegator_address\` (\`delegator_address\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`delegator_address\` ON \`delegations\``,
    );
    await queryRunner.query(`DROP TABLE \`delegations\``);
  }
}
