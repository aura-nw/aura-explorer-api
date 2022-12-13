import { MigrationInterface, QueryRunner } from 'typeorm';

export class removeDuplicateDelegations1652689008852
  implements MigrationInterface
{
  name = 'removeDuplicateDelegations1652689008852';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`SET SQL_SAFE_UPDATES = 0`);
    await queryRunner.query(`DELETE c1 
            FROM delegations c1 
                INNER JOIN delegations c2 
            WHERE c1.id > c2.id AND c1.tx_hash = c2.tx_hash AND c1.delegator_address = c2.delegator_address AND c1.validator_address = c2.validator_address`);
    await queryRunner.query(`SET SQL_SAFE_UPDATES = 1`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`IDX_7ff3dbad33d546ab7cbee99ee2\` ON \`delegations\` (\`tx_hash\`, \`delegator_address\`, \`validator_address\`)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_7ff3dbad33d546ab7cbee99ee2\` ON \`delegations\``,
    );
  }
}
