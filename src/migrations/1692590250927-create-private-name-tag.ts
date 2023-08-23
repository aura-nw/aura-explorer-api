import { MigrationInterface, QueryRunner } from 'typeorm';

export class createPrivateNameTag1692590250927 implements MigrationInterface {
  name = 'createPrivateNameTag1692590250927';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`cipher_keys\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`cipher_text\` text NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`private_name_tag\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`type\` varchar(255) NOT NULL, \`name_tag\` text NOT NULL, \`note\` varchar(500) NULL, \`address\` varchar(255) NOT NULL, \`created_by\` int NOT NULL, UNIQUE INDEX \`IDX_48e62ba1559c6bf12df8a0c6d7\` (\`address\`, \`created_by\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // No action
  }
}
