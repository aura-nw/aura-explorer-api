import { MigrationInterface, QueryRunner } from 'typeorm';

export class addPublicNameTagToExplorer1706172325111
  implements MigrationInterface
{
  name = 'addPublicNameTagToExplorer1706172325111';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`public_name_tag\` ADD \`explorer_id\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`public_name_tag\`
      ADD CONSTRAINT \`FK_0292f6ab7ced48369f4dfb6e763\`
      FOREIGN KEY (\`explorer_id\`)
      REFERENCES \`explorer\`(\`id\`) ON DELETE CASCADE`,
    );
    // Update current data explorer_id to 1 (aura network)
    await queryRunner.query('UPDATE public_name_tag SET explorer_id = 1');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`public_name_tag\` DROP FOREIGN KEY \`FK_0292f6ab7ced48369f4dfb6e763\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`public_name_tag\` DROP COLUMN \`explorer_id\``,
    );
  }
}
