import { MigrationInterface, QueryRunner } from 'typeorm';

export class addChainIdToTokenMarket1701052101011
  implements MigrationInterface
{
  name = 'addChainIdToTokenMarket1701052101011';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`token_markets\` ADD \`chain_id\` varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`token_markets\` DROP COLUMN \`chain_id\``,
    );
  }
}
