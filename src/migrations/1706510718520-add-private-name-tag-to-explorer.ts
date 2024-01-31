import { MigrationInterface, QueryRunner } from 'typeorm';

export class addPrivateNameTagToExplorer1706510718520
  implements MigrationInterface
{
  name = 'addPrivateNameTagToExplorer1706510718520';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`private_name_tag\` ADD \`explorer_id\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`private_name_tag\` ADD CONSTRAINT \`FK_6e5ec60cb4d1774d28c11e3b41a\` FOREIGN KEY (\`explorer_id\`) REFERENCES \`explorer\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    // Default update current data to 1 (aura network)
    await queryRunner.query(`SET SQL_SAFE_UPDATES = 0`);
    await queryRunner.query(`UPDATE private_name_tag SET explorer_id = 1`);
    await queryRunner.query(`SET SQL_SAFE_UPDATES = 1`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`private_name_tag\` DROP FOREIGN KEY \`FK_6e5ec60cb4d1774d28c11e3b41a\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`private_name_tag\` DROP COLUMN \`explorer_id\``,
    );
  }
}
