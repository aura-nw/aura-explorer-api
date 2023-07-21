import { MigrationInterface, QueryRunner } from 'typeorm';

export class addComlumToTableSmartContracts1667475684805
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` ADD \`coin_id\` varchar(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` ADD \`image\` varchar(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` ADD \`description\` varchar(255)`,
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
