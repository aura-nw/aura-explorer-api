import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateTableTokenContracts1659321056909
  implements MigrationInterface
{
  name = 'updateTableTokenContracts1659321056909';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`token_contracts\` CHANGE \`decimal\` \`decimals\` INT NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`token_contracts\` CHANGE \`max_total_supply\` \`total_supply\` DECIMAL(30, 6) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`token_contracts\` CHANGE \`description\` \`description\` TEXT NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`token_contracts\` DROP COLUMN \`is_main_token\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`token_contracts\` ADD \`balance\` DECIMAL(30, 6) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`token_contracts\` ADD \`owner\` VARCHAR(255) NOT NULL`,
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
