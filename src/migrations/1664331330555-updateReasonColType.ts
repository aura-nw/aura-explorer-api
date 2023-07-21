import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateReasonColType1664331330555 implements MigrationInterface {
  name = 'updateReasonColType1664331330555';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`deployment_requests\` MODIFY COLUMN \`reason\` text NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`deployment_requests\` MODIFY COLUMN \`reason\` varchar(255) NULL`,
    );
  }
}
