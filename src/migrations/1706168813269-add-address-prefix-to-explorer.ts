import { MigrationInterface, QueryRunner } from 'typeorm';

export class addAddressPrefixToExplorer1706168813269
  implements MigrationInterface
{
  name = 'addAddressPrefixToExplorer1706168813269';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`explorer\`
      ADD \`address_prefix\` varchar(255) NOT NULL,
      ADD \`chain_db\` VARCHAR(255) NOT NULL;`,
    );

    await queryRunner.query(
      `UPDATE \`explorer\` SET \`address_prefix\` = 'aura', \`chain_db\` = 'serenity' WHERE \`id\` = '1'`,
    );

    await queryRunner.query(
      `UPDATE \`explorer\` SET \`address_prefix\` = 'sei', \`chain_db\` = 'pacific' WHERE \`id\` = '2'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`explorer\` DROP COLUMN \`address_prefix\`,
      DROP COLUMN \`chain_db\``,
    );
  }
}
