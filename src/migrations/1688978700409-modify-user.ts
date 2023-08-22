import { MigrationInterface, QueryRunner } from 'typeorm';

export class modifyUser1688978700409 implements MigrationInterface {
  name = 'modifyUser1688978700409';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_d34106f8ec1ebaf66f4f8609dd\` ON \`user\``,
    );
    await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`user_name\``);
    await queryRunner.query(
      `ALTER TABLE \`user\` RENAME COLUMN \`confirmation_token\` TO \`verification_token\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` RENAME COLUMN \`confirmed_at\` TO \`verified_at\``,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user\` ADD \`user_name\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`IDX_d34106f8ec1ebaf66f4f8609dd\` ON \`user\` (\`user_name\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` RENAME COLUMN \`verification_token\` TO \`confirmation_token\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` RENAME COLUMN \`verified_at\` TO \`confirmed_at\``,
    );
  }
}
