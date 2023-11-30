import { MigrationInterface, QueryRunner } from 'typeorm';

export class createChainInfo1701245216668 implements MigrationInterface {
  name = 'createChainInfo1701245216668';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`chain_info\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
      \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`chain_id\` varchar(255) NOT NULL,
      \`chain_name\` varchar(255) NOT NULL,
      \`chain_image\` varchar(255) NOT NULL,
      UNIQUE INDEX \`IDX_ab5accf171432c687f0cf91edf\` (\`chain_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`chain_info\``);
  }
}
