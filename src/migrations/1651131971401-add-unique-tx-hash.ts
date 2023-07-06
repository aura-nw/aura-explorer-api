import { MigrationInterface, QueryRunner } from 'typeorm';

export class addUniqueTxHash1651131971401 implements MigrationInterface {
  name = 'addUniqueTxHash1651131971401';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`SET SQL_SAFE_UPDATES = 0`);
    await queryRunner.query(
      `DELETE c1 FROM delegations c1 INNER JOIN delegations c2 WHERE c1.id > c2.id AND c1.tx_hash = c2.tx_hash`,
    );
    await queryRunner.query(
      `DELETE c1 FROM delegator_rewards c1 INNER JOIN delegator_rewards c2 WHERE c1.id > c2.id AND c1.tx_hash = c2.tx_hash`,
    );
    await queryRunner.query(
      `DELETE c1 FROM history_proposals c1 INNER JOIN history_proposals c2 WHERE c1.id > c2.id AND c1.tx_hash = c2.tx_hash`,
    );
    await queryRunner.query(
      `DELETE c1 FROM proposal_deposits c1 INNER JOIN proposal_deposits c2 WHERE c1.id > c2.id AND c1.tx_hash = c2.tx_hash`,
    );
    await queryRunner.query(
      `DELETE c1 FROM proposal_votes c1 INNER JOIN proposal_votes c2 WHERE c1.id > c2.id AND c1.tx_hash = c2.tx_hash`,
    );
    await queryRunner.query(`SET SQL_SAFE_UPDATES = 1`);

    await queryRunner.query(
      `CREATE UNIQUE INDEX \`tx_hash\` ON \`delegations\` (\`tx_hash\`)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`tx_hash\` ON \`delegator_rewards\` (\`tx_hash\`)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`tx_hash\` ON \`history_proposals\` (\`tx_hash\`)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`tx_hash\` ON \`proposal_deposits\` (\`tx_hash\`)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`tx_hash\` ON \`proposal_votes\` (\`tx_hash\`)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX \`tx_hash\` ON \`proposal_votes\``);
    await queryRunner.query(`DROP INDEX \`tx_hash\` ON \`proposal_deposits\``);
    await queryRunner.query(`DROP INDEX \`tx_hash\` ON \`history_proposals\``);
    await queryRunner.query(`DROP INDEX \`tx_hash\` ON \`delegator_rewards\``);
    await queryRunner.query(`DROP INDEX \`tx_hash\` ON \`delegations\``);
  }
}
