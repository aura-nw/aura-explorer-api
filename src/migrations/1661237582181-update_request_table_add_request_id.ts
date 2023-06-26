import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateRequestTableAddRequestId1661237582181
  implements MigrationInterface
{
  name = 'updateRequestTableAddRequestId1661237582181';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`deployment_requests\` ADD \`request_id\` int NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`deployment_requests\` DROP COLUMN \`request_id\``,
    );
  }
}
