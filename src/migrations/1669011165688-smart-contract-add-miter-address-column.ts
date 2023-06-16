import { MigrationInterface, QueryRunner } from 'typeorm';

export class smartContractAddMiterAddressColumn1669011165688
  implements MigrationInterface
{
  name = 'smartContractAddMiterAddressColumn1669011165688';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` ADD \`minter_address\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX \`IDX_048b937bd9e214c811118593ff\` ON \`smart_contracts\` (\`minter_address\`)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_048b937bd9e214c811118593ff\` ON \`smart_contracts\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` DROP COLUMN \`minter_address\``,
    );
  }
}
