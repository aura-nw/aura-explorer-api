import { MigrationInterface, QueryRunner } from 'typeorm';

export class addTokenNameToTableSoulboud1673325541416
  implements MigrationInterface
{
  name = 'addTokenNameToTableSoulboud1673325541416';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`soulbound_token\` ADD \`token_name\` varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`soulbound_token\` DROP COLUMN \`token_name\``,
    );
  }
}
