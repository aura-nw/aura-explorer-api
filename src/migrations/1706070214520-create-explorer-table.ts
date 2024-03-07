import { MigrationInterface, QueryRunner } from 'typeorm';

export class createExplorerTable1706070214520 implements MigrationInterface {
  name = 'createExplorerTable1706070214520';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`explorer\`
      (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
      \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`chain_id\` varchar(255) NOT NULL,
      \`name\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );

    await queryRunner.query(
      `INSERT INTO \`explorer\` (\`chain_id\`, \`name\`) VALUES
      ('euphoria-2', 'Aura')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`explorer\``);
  }
}
