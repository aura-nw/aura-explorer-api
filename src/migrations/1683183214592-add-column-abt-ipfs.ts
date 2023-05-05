import { MigrationInterface, QueryRunner } from 'typeorm';

export class addColumnAbtIpfs1683183214592 implements MigrationInterface {
  name = 'addColumnAbtIpfs1683183214592';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`soulbound_token\` ADD \`ipfs\` text NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`soulbound_token\` DROP COLUMN \`animation_url_s3\``,
    );
  }
}
