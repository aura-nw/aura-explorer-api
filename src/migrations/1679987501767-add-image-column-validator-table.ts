import { MigrationInterface, QueryRunner } from 'typeorm';

export class addImageColumnValidatorTable1679987501767
  implements MigrationInterface
{
  name = 'addImageColumnValidatorTable1679987501767';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`validators\` ADD \`image_url\` varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`image_url\` DROP COLUMN \`image\``);
  }
}
