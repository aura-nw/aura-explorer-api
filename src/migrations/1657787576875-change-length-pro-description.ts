import { MigrationInterface, QueryRunner } from 'typeorm';

export class changeLengthProDescription1657787576875
  implements MigrationInterface
{
  name = 'changeLengthProDescription1657787576875';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`proposals\` CHANGE COLUMN \`pro_description\` \`pro_description\` TEXT NULL`,
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
