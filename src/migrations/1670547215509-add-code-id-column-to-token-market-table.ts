import { MigrationInterface, QueryRunner } from 'typeorm';

export class addCodeIdColumnToTokenMarketTable1670547215509
  implements MigrationInterface
{
  name = 'addCodeIdColumnToTokenMarketTable1670547215509';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`token_markets\` ADD \`code_id\` int NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX \`IDX_13fee55b87572c6f4ce57d54b2\` ON \`token_markets\` (\`code_id\`)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_13fee55b87572c6f4ce57d54b2\` ON \`token_markets\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`token_markets\` DROP COLUMN \`code_id\``,
    );
  }
}
