import { MigrationInterface, QueryRunner } from 'typeorm';

export class removeCodeIdFromTokenMarket1701144278720
  implements MigrationInterface
{
  name = 'removeCodeIdFromTokenMarket1701144278720';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`token_markets\` DROP COLUMN \`code_id\``,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`token_markets\` ADD \`code_id\` int NOT NULL DEFAULT '0'`,
    );
  }
}
