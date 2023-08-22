import { MigrationInterface, QueryRunner } from 'typeorm';

export class addEncryptedPasswordConfirmedAtConfirmationTokenConfirmationSentAt1687920496846
  implements MigrationInterface
{
  name =
    'addEncryptedPasswordConfirmedAtConfirmationTokenConfirmationSentAt1687920496846';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user\` ADD \`encrypted_password\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` ADD \`confirmation_token\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` ADD \`confirmed_at\` datetime NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` ADD \`user_name\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` ADD UNIQUE INDEX \`IDX_d34106f8ec1ebaf66f4f8609dd\` (\`user_name\`)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user\` DROP INDEX \`IDX_d34106f8ec1ebaf66f4f8609dd\``,
    );
    await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`user_name\``);
    await queryRunner.query(
      `ALTER TABLE \`user\` DROP COLUMN \`confirmed_at\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` DROP COLUMN \`confirmation_token\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` DROP COLUMN \`encrypted_password\``,
    );
  }
}
