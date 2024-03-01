import { MigrationInterface, QueryRunner } from 'typeorm';

export class addExplorerToAsset1709275387567 implements MigrationInterface {
  name = 'addExplorerToAsset1709275387567';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`asset\` ADD \`explorer_id\` int NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE \`asset\` ADD CONSTRAINT \`FK_9c2512328742026fd8d7e37da9c\` FOREIGN KEY (\`explorer_id\`) REFERENCES \`explorer\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    // Update current data explorer_id to 1 (aura network)
    await queryRunner.query(`SET SQL_SAFE_UPDATES = 0`);
    await queryRunner.query('UPDATE asset SET explorer_id = 1');
    await queryRunner.query(`SET SQL_SAFE_UPDATES = 1`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`asset\` DROP FOREIGN KEY \`FK_9c2512328742026fd8d7e37da9c\``,
    );

    await queryRunner.query(
      `ALTER TABLE \`asset\` DROP COLUMN \`explorer_id\``,
    );
  }
}
