import { MigrationInterface, QueryRunner } from 'typeorm';

export class addImageTypeToTableSoulbound1673419192745
  implements MigrationInterface
{
  name = 'addImageTypeToTableSoulbound1673419192745';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`soulbound_token\` ADD \`img_type\` varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`soulbound_token\` DROP COLUMN \`img_type\``,
    );
  }
}
