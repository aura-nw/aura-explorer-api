import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateTypeSelfBondedValidators1658482408843
  implements MigrationInterface
{
  name = 'updateTypeSelfBondedValidators1658482408843';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`validators\` CHANGE \`self_bonded\` \`self_bonded\` DOUBLE NOT NULL`,
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
