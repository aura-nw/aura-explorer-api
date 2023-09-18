import { MigrationInterface, QueryRunner } from 'typeorm';

export class addDenomColumnTokenMarket1694571809657
  implements MigrationInterface
{
  name = 'addDenomColumnTokenMarket1694571809657';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`token_markets\` ADD \`denom\` varchar(255) NULL AFTER \`contract_address\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`token_markets\` ADD \`decimal\` int NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`token_markets\` CHANGE \`code_id\` \`code_id\` int NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`token_markets\` CHANGE \`coin_id\` \`coin_id\` varchar(255) NOT NULL DEFAULT ''`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`token_markets\` DROP COLUMN \`denom\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`token_markets\` DROP COLUMN \`decimal\``,
    );
  }
}
