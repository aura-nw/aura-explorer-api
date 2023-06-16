import { MigrationInterface, QueryRunner } from 'typeorm';

export class delegationsChangeColumnType1652439036844
  implements MigrationInterface
{
  name = 'delegationsChangeColumnType1652439036844';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`delegations\`
        CHANGE COLUMN \`amount\` \`amount\` DECIMAL(30,6) NOT NULL `);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
