import { MigrationInterface, QueryRunner } from 'typeorm';

export class addChainInfoToExplorer1706502043813 implements MigrationInterface {
  name = 'addChainInfoToExplorer1706502043813';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`explorer\` ADD \`minimal_denom\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`explorer\` ADD \`decimal\` int NOT NULL`,
    );

    await queryRunner.query(`SET SQL_SAFE_UPDATES = 0`);
    await queryRunner.query(
      `UPDATE \`explorer\` SET \`minimal_denom\` = 'uaura', \`decimal\` = 6 WHERE \`id\` = 1`,
    );
    await queryRunner.query(`SET SQL_SAFE_UPDATES = 1`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`explorer\` DROP COLUMN \`decimal\``);
    await queryRunner.query(
      `ALTER TABLE \`explorer\` DROP COLUMN \`minimal_denom\``,
    );
  }
}
