import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateReferenceCodeIdType1664179353252
  implements MigrationInterface
{
  name = 'updateReferenceCodeIdType1664179353252';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` MODIFY COLUMN \`reference_code_id\` int`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` MODIFY COLUMN \`reference_code_id\` varchar(255)`,
    );
  }
}
