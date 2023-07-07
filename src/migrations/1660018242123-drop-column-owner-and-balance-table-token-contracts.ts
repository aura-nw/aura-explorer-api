import { MigrationInterface, QueryRunner } from 'typeorm';

export class dropColumnOwnerAndBalanceTableTokenContracts1660018242123
  implements MigrationInterface
{
  name = 'dropColumnOwnerAndBalanceTableTokenContracts1660018242123';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`token_contracts\` DROP COLUMN \`balance\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`token_contracts\` DROP COLUMN \`owner\``,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`token_contracts\` ADD \`owner\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`token_contracts\` ADD \`balance\` decimal(30,6) NOT NULL`,
    );
  }
}
