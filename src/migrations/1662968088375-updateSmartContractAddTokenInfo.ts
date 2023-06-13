import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateSmartContractAddTokenInfo1662968088375
  implements MigrationInterface
{
  name = 'updateSmartContractAddTokenInfo1662968088375';

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  public async up(queryRunner: QueryRunner): Promise<void> {
    // await queryRunner.query(`ALTER TABLE smart_contracts ADD token_name VARCHAR(255) NOT NULL DEFAULT ''`);
    // await queryRunner.query(`ALTER TABLE smart_contracts ADD token_symbol VARCHAR(255) NOT NULL DEFAULT ''`);
    // await queryRunner.query(`ALTER TABLE smart_contracts ADD num_tokens BIGINT NOT NULL DEFAULT 0`);
    // await queryRunner.query(`ALTER TABLE smart_contracts ADD is_minted tinyint NOT NULL DEFAULT 0`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
