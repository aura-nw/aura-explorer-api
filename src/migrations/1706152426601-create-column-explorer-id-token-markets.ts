import { MigrationInterface, QueryRunner } from 'typeorm';

export class createColumnExplorerIdTokenMarkets1706152426601
  implements MigrationInterface
{
  name = 'createColumnExplorerIdTokenMarkets1706152426601';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`token_markets\` ADD \`explorer_id\` int NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE \`token_markets\` ADD CONSTRAINT \`FK_085454ab10428ee1a930aeba7b6\` FOREIGN KEY (\`explorer_id\`) REFERENCES \`explorer\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    await queryRunner.query(`SET SQL_SAFE_UPDATES = 0`);

    await queryRunner.query(`UPDATE \`token_markets\` SET \`explorer_id\` = 1`);

    await queryRunner.query(`SET SQL_SAFE_UPDATES = 1`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`token_markets\` DROP FOREIGN KEY \`FK_085454ab10428ee1a930aeba7b6\``,
    );

    await queryRunner.query(
      `ALTER TABLE \`token_markets\` DROP COLUMN \`explorer_id\``,
    );
  }
}
