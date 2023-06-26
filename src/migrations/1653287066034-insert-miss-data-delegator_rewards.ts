import { MigrationInterface, QueryRunner } from 'typeorm';

export class insertMissDataDelegatorRewards1653287066034
  implements MigrationInterface
{
  name = 'insertMissDataDelegatorRewards1653287066034';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`delegator_rewards\` CHANGE \`amount\` \`amount\` bigint NOT NULL`,
    );
    await queryRunner.query(`INSERT INTO delegator_rewards (tx_hash, delegator_address, validator_address, amount)
            SELECT t1.tx_hash, t1.delegator_address, t1.validator_address, t2.amount FROM (
                (SELECT tx_hash, delegator_address, validator_address
                    FROM delegations WHERE amount > 0) t1
                INNER JOIN
                (SELECT tx_hash, IFNULL(REPLACE(REPLACE(JSON_EXTRACT(raw_log, '$[0].events[4].attributes[5].value'), 'uaura', ''), '\"', ''), 0) AS amount
                    FROM transactions WHERE code = 0) t2
                ON t1.tx_hash = t2.tx_hash
                ) WHERE t1.tx_hash IN (
                    SELECT dr.tx_hash FROM delegator_rewards dr
                        INNER JOIN delegations d ON dr.tx_hash = d.tx_hash AND d.type = 'Redelegate'
                        GROUP BY dr.tx_hash
                )`);
    await queryRunner.query(`INSERT INTO delegator_rewards (tx_hash, delegator_address, validator_address, amount)
            SELECT t1.tx_hash, t1.delegator_address, t1.validator_address, t2.amount FROM (
            (SELECT tx_hash, delegator_address, validator_address
                FROM delegations WHERE amount < 0) t1
            INNER JOIN
            (SELECT tx_hash, REPLACE(REPLACE(JSON_EXTRACT(raw_log, '$[0].events[4].attributes[2].value'), 'uaura', ''), '\"', '') AS amount
                FROM transactions WHERE code = 0) t2
            ON t1.tx_hash = t2.tx_hash
            ) WHERE t1.tx_hash IN (
                SELECT tx_hash from delegations
                WHERE type IN ('Redelegate')
                    AND tx_hash NOT IN (SELECT tx_hash FROM delegator_rewards)
            )
            UNION ALL
            (SELECT tx_hash, delegator_address, validator_address, 0
                FROM delegations
                WHERE tx_hash IN (
                    SELECT tx_hash
                    FROM delegations
                    WHERE type IN ('Redelegate')
                        AND tx_hash NOT IN (SELECT tx_hash FROM delegator_rewards)
                ) AND amount > 0)`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
