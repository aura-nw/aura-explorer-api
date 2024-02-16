import { MigrationInterface, QueryRunner } from 'typeorm';

export class addNotificationToExplorer1706864486154
  implements MigrationInterface
{
  name = 'addNotificationToExplorer1706864486154';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`sync_point\` ADD \`explorer_id\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_activity\` ADD \`explorer_id\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`notification\` ADD \`explorer_id\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sync_point\` ADD CONSTRAINT \`FK_0a8e5e1a93242576a21fb84b038\` FOREIGN KEY (\`explorer_id\`) REFERENCES \`explorer\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_activity\` ADD CONSTRAINT \`FK_c34fa2ce1d5f7ffe4ad345509ed\` FOREIGN KEY (\`explorer_id\`) REFERENCES \`explorer\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`notification\` ADD CONSTRAINT \`FK_97548ae97923c455c93140651f3\` FOREIGN KEY (\`explorer_id\`) REFERENCES \`explorer\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    // Update current data explorer_id to 1 (aura network)
    await queryRunner.query(`SET SQL_SAFE_UPDATES = 0`);
    await queryRunner.query('UPDATE sync_point SET explorer_id = 1');
    await queryRunner.query('UPDATE user_activity SET explorer_id = 1');
    await queryRunner.query('UPDATE notification SET explorer_id = 1');
    await queryRunner.query(`SET SQL_SAFE_UPDATES = 1`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`notification\` DROP FOREIGN KEY \`FK_97548ae97923c455c93140651f3\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_activity\` DROP FOREIGN KEY \`FK_c34fa2ce1d5f7ffe4ad345509ed\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`sync_point\` DROP FOREIGN KEY \`FK_0a8e5e1a93242576a21fb84b038\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`notification\` DROP COLUMN \`explorer_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_activity\` DROP COLUMN \`explorer_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`sync_point\` DROP COLUMN \`explorer_id\``,
    );
  }
}
