import { MigrationInterface, QueryRunner } from 'typeorm';

export class addCascadeOfUser1689325529321 implements MigrationInterface {
  name = 'addCascadeOfUser1689325529321';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user_activity\` DROP CONSTRAINT \`FK_11108754ec780c670440e32baad\``,
    );

    await queryRunner.query(
      `ALTER TABLE \`user_activity\` ADD CONSTRAINT \`FK_11108754ec780c670440e32baad\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //No action.
  }
}
