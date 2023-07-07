import { MigrationInterface, QueryRunner } from 'typeorm';

export class createTableDelegatorRewards1650510478234
  implements MigrationInterface
{
  name = 'createTableDelegatorRewards1650510478234';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`delegator_rewards\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`delegator_address\` varchar(255) NOT NULL, \`validator_address\` varchar(255) NOT NULL, \`amount\` int NOT NULL, \`tx_hash\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`delegator_rewards\``);
  }
}
