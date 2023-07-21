import { MigrationInterface, QueryRunner } from 'typeorm';

export class addFromAddressAndToAddressTableTokenTransactions1661507865522
  implements MigrationInterface
{
  name = 'addFromAddressAndToAddressTableTokenTransactions1661507865522';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`token_transactions\` ADD \`from_address\` varchar(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`token_transactions\` ADD \`to_address\` varchar(255)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`token_transactions\` DROP COLUMN \`to_address\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`token_transactions\` DROP COLUMN \`from_address\``,
    );
  }
}
