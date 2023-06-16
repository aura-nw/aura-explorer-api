import { MigrationInterface, QueryRunner } from 'typeorm';

export class addColumnTxHashToTableDelegations1650439761594
  implements MigrationInterface
{
  name = 'addColumnTxHashToTableDelegations1650439761594';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`delegations\` ADD \`tx_hash\` varchar(255) NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`delegations\` DROP COLUMN \`tx_hash\``,
    );
  }
}
