import { MigrationInterface, QueryRunner } from 'typeorm';

export class addDecimalsColumnsIntoSmartconstracts1669619747642
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` ADD \`decimals\` INT  NOT NULL DEFAULT 0`,
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
