import { MigrationInterface, QueryRunner } from 'typeorm';

export class changeMsgCodeToNullable1676859411601
  implements MigrationInterface
{
  name = 'changeMsgCodeToNullable1676859411601';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`verify_code_step\` CHANGE \`msg_code\` \`msg_code\` varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`verify_code_step\` CHANGE \`msg_code\` \`msg_code\` varchar(255) NOT NULL`,
    );
  }
}
