import { MigrationInterface, QueryRunner } from 'typeorm';

export class addColumnIsBurnToTableNfts1660548244730
  implements MigrationInterface
{
  name = 'addColumnIsBurnToTableNfts1660548244730';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`nfts\` ADD \`is_burn\` tinyint NOT NULL DEFAULT 0`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`nfts\` DROP COLUMN \`is_burn\``);
  }
}
