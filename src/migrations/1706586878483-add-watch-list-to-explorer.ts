import { MigrationInterface, QueryRunner } from 'typeorm';

export class addWatchListToExplorer1706586878483 implements MigrationInterface {
  name = 'addWatchListToExplorer1706586878483';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`watch_list\` ADD \`explorer_id\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`watch_list\` ADD CONSTRAINT \`FK_45843bf84af3e2e815e7aae4359\` FOREIGN KEY (\`explorer_id\`) REFERENCES \`explorer\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    // Default set explorer_id = 1 (aura network)
    await queryRunner.query(`SET SQL_SAFE_UPDATES = 0`);
    await queryRunner.query(`UPDATE watch_list SET explorer_id = 1`);
    await queryRunner.query(`SET SQL_SAFE_UPDATES = 1`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`watch_list\` DROP FOREIGN KEY \`FK_45843bf84af3e2e815e7aae4359\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`watch_list\` DROP COLUMN \`explorer_id\``,
    );
  }
}
