import { MigrationInterface, QueryRunner } from 'typeorm';

export class refactorTableDatabase1701678792982 implements MigrationInterface {
  name = 'refactorTableDatabase1701678792982';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`block_sync_error\``);
    await queryRunner.query(`DROP TABLE \`blocks\``);
    await queryRunner.query(`DROP TABLE \`cw20_token_owners\``);
    await queryRunner.query(`DROP TABLE \`delegations\``);
    await queryRunner.query(`DROP TABLE \`delegator_rewards\``);
    await queryRunner.query(`DROP TABLE \`deployment_requests\``);
    await queryRunner.query(`DROP TABLE \`missed_block\``);
    await queryRunner.query(`DROP TABLE \`proposal_votes\``);
    await queryRunner.query(`DROP TABLE \`smart_contract_codes\``);
    await queryRunner.query(`DROP TABLE \`smart_contracts\``);
    await queryRunner.query(`DROP TABLE \`tags\``);
    await queryRunner.query(`DROP TABLE \`transactions\``);
    await queryRunner.query(`DROP TABLE \`validators\``);
    await queryRunner.query(`DROP TABLE \`verify_code_step\``);
    await queryRunner.query(`DROP TABLE \`verify_item_check\``);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // No action
  }
}
