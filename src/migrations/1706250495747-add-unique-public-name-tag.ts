import { MigrationInterface, QueryRunner } from 'typeorm';

export class addUniquePublicNameTag1706250495747 implements MigrationInterface {
  name = 'addUniquePublicNameTag1706250495747';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_48232194001651d584dbff792d\` ON \`public_name_tag\``,
    );

    await queryRunner.query(
      `CREATE UNIQUE INDEX \`IDX_c923681fe7f04aa3b9c6de97fc\` ON \`public_name_tag\` (\`name_tag\`, \`explorer_id\`)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_c923681fe7f04aa3b9c6de97fc\` ON \`public_name_tag\``,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`IDX_48232194001651d584dbff792d\` ON \`public_name_tag\` (\`name_tag\`)`,
    );
  }
}
