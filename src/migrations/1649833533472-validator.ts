import { MigrationInterface, QueryRunner } from 'typeorm';

export class validator1649833533472 implements MigrationInterface {
  name = 'validator1649833533472';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`validators\` ADD \`status\` int NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE \`validators\` DROP COLUMN \`jailed\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`validators\` ADD \`jailed\` tinyint NOT NULL DEFAULT 0`,
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
