import { MigrationInterface, QueryRunner } from 'typeorm';

export class deleteUniqueIndexDelegations1651206022951
  implements MigrationInterface
{
  name = 'deleteUniqueIndexDelegations1651206022951';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX \`tx_hash\` ON \`delegations\``);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`tx_hash\` ON \`delegations\` (\`tx_hash\`)`,
    );
  }
}
