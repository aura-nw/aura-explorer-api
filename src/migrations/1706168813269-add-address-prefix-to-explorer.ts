import { MigrationInterface, QueryRunner } from 'typeorm';

export class addAddressPrefixToExplorer1706168813269
  implements MigrationInterface {
  name = 'addAddressPrefixToExplorer1706168813269';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`explorer\`
      ADD \`address_prefix\` varchar(255) NOT NULL,
      ADD \`chain_db\` VARCHAR(255) NOT NULL;`,
    );
    await queryRunner.query('TRUNCATE TABLE explorer;');
    await queryRunner.query(
      `INSERT INTO \`explorer\` (\`chain_id\`, \`name\`, \`address_prefix\`, \`chain_db\`) VALUES
      ('aura-testnet-2', 'Aura', 'aura', 'auratestnet'),
      ('pacific-1', 'Sei', 'sei', 'pacific')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`explorer\` DROP COLUMN \`address_prefix\`,
      DROP COLUMN \`chain_db\``,
    );
  }
}
