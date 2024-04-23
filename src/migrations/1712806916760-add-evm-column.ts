import { MigrationInterface, QueryRunner } from 'typeorm';

export class addEvmColumn1712806916760 implements MigrationInterface {
  name = 'addEvmColumn1712806916760';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`explorer\` ADD \`evm_denom\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`explorer\` ADD \`evm_decimal\` int NOT NULL`,
    );

    await queryRunner.query(`SET SQL_SAFE_UPDATES = 0`);
    await queryRunner.query(
      `UPDATE explorer set evm_decimal = 18, evm_denom = 'aeaura' where id = 1`,
    );
    await queryRunner.query(`SET SQL_SAFE_UPDATES = 1`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`explorer\` DROP COLUMN \`evm_decimal\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`explorer\` DROP COLUMN \`evm_denom\``,
    );
  }
}
