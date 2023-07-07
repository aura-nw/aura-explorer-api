import { MigrationInterface, QueryRunner } from 'typeorm';

export class addUriS3ToTableNfts1661741160979 implements MigrationInterface {
  name = 'addUriS3ToTableNfts1661741160979';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`nfts\` ADD \`uri_s3\` varchar(255) NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`nfts\` DROP COLUMN \`uri_s3\``);
  }
}
