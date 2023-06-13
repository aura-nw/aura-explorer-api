import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateRequestsTableAddS31661481257986
  implements MigrationInterface
{
  name = 'updateRequestsTableAddS31661481257986';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`deployment_requests\` ADD \`s3_location\` varchar(255) NOT NULL AFTER \`compiler_version\``,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`deployment_requests\` DROP COLUMN \`s3_location\``,
    );
  }
}
