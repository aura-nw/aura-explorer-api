import { MigrationInterface, QueryRunner } from 'typeorm';

export class soulboundToken1669097572408 implements MigrationInterface {
  name = 'soulboundToken1669097572408';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`soulbound_token\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`contract_address\` varchar(255) NOT NULL, \`token_id\` varchar(255) NOT NULL, \`token_uri\` varchar(255) NOT NULL, \`token_img\` varchar(255) NOT NULL, \`receiver_address\` varchar(255) NOT NULL, \`status\` enum ('Unclaimed', 'Equipped', 'Unequipped', 'Pending') NOT NULL DEFAULT 'Unclaimed', \`signature\` text NOT NULL, \`pub_key\` text NOT NULL, \`picked\` tinyint NOT NULL DEFAULT 0, INDEX \`IDX_980291b3c42833e42d0ebb4c92\` (\`contract_address\`), UNIQUE INDEX \`IDX_145a803764f97c98b71b9eeb80\` (\`token_id\`,\`contract_address\`), INDEX \`IDX_255881ce0014160963f7ac3c0f\` (\`receiver_address\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_255881ce0014160963f7ac3c0f\` ON \`soulbound_token\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_145a803764f97c98b71b9eeb80\` ON \`soulbound_token\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_980291b3c42833e42d0ebb4c92\` ON \`soulbound_token\``,
    );
    await queryRunner.query(`DROP TABLE \`soulbound_token\``);
  }
}
