import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateRequestTableAddRequestAddress1663039495247
  implements MigrationInterface
{
  name = 'updateRequestTableAddRequestAddress1663039495247';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`deployment_requests\` ADD \`requester_address\` varchar(255) NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`deployment_requests\` DROP COLUMN \`requester_address\``,
    );
  }
}
