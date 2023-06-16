import { MigrationInterface, QueryRunner } from 'typeorm';

export class addColumnTypeToTableDelegationsAndDeleteUniqueKey1650443430848
  implements MigrationInterface
{
  name = 'addColumnTypeToTableDelegationsAndDeleteUniqueKey1650443430848';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`delegator_address\` ON \`delegations\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`delegations\` ADD \`type\` varchar(255) NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`delegations\` DROP COLUMN \`type\``);
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`delegator_address\` ON \`delegations\` (\`delegator_address\`)`,
    );
  }
}
