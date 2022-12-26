import { MigrationInterface, QueryRunner } from 'typeorm';

export class validatorChangePrimaryKey1671694080717
  implements MigrationInterface
{
  name = 'validatorChangePrimaryKey1671694080717';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`validators\` DROP COLUMN \`id\`, DROP PRIMARY KEY, ADD PRIMARY KEY (\`operator_address\`)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`validators\` ADD COLUMN \`id\` VARCHAR(45) NOT NULL AFTER \`jailed\`, DROP PRIMARY KEY, ADD PRIMARY KEY (\`id\`)`,
    );
  }
}
