import { MigrationInterface, QueryRunner } from 'typeorm';

export class addColumnBondedHeightToValidatorTable1682491012763
  implements MigrationInterface
{
  name = 'addColumnBondedHeightToValidatorTable1682491012763';
  //move boned_height to sync service.
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`validators\` ADD \`bonded_height\` float NOT NULL DEFAULT '1'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`validators\` DROP COLUMN \`bonded_height\``,
    );
  }
}
