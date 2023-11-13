import { MigrationInterface, QueryRunner } from 'typeorm';

export class deleteColumnNotification1699522851065
  implements MigrationInterface
{
  name = 'deleteColumnNotification1699522851065';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`notification\` DROP COLUMN \`token\``,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`notification\` ADD \`token\` varchar(255) NOT NULL`,
    );
  }
}
