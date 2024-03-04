import { MigrationInterface, QueryRunner } from 'typeorm';

export class changeTypeImageForAsset1709286872723
  implements MigrationInterface
{
  name = 'changeTypeImageForAsset1709286872723';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE asset MODIFY image TEXT NULL;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE asset MODIFY image varchar(255) NULL;`,
    );
  }
}
