import { MigrationInterface, QueryRunner } from 'typeorm';

export class addColumnNumTokensToTableTokenContracts1660534506643
  implements MigrationInterface
{
  name = 'addColumnNumTokensToTableTokenContracts1660534506643';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`token_contracts\` ADD \`num_tokens\` BIGINT NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`token_contracts\` DROP COLUMN \`num_tokens\``,
    );
  }
}
