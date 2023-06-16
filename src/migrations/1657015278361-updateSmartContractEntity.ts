import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateSmartContractEntity1657015278361
  implements MigrationInterface
{
  name = 'updateSmartContractEntity1657015278361';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` ADD \`s3_location\` varchar(255)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` DROP COLUMN \`s3_location\``,
    );
  }
}
