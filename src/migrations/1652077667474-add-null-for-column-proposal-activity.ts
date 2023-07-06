import { MigrationInterface, QueryRunner } from 'typeorm';

export class addNullForColumnProposalActivity1652077667474
  implements MigrationInterface
{
  name = 'addNullForColumnProposalActivity1652077667474';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`proposals\` CHANGE \`pro_activity\` \`pro_activity\` json NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`proposals\` CHANGE \`pro_activity\` \`pro_activity\` json NOT NULL`,
    );
  }
}
