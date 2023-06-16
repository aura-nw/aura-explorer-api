import { MigrationInterface, QueryRunner } from 'typeorm';

export class transactionAddContractAddressColumn1654507337079
  implements MigrationInterface
{
  name = 'transactionAddContractAddressColumn1654507337079';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`transactions\` ADD \`contract_address\` varchar(255) NOT NULL DEFAULT ''`,
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
