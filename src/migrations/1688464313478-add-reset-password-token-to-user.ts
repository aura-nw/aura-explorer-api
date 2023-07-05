import { MigrationInterface, QueryRunner } from 'typeorm';

export class addResetPasswordTokenToUser1688464313478
  implements MigrationInterface
{
  name = 'addResetPasswordTokenToUser1688464313478';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user\` ADD \`reset_password_token\` varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user\` DROP COLUMN \`reset_password_token\``,
    );
  }
}
