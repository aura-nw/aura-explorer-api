import { MigrationInterface, QueryRunner } from 'typeorm';

export class transactionsFKCASCASE1654062978114 implements MigrationInterface {
  name = 'transactionsFKCASCASE1654062978114';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`transactions\` DROP FOREIGN KEY \`FK_e11180855c1afd8fe21f96a1bf8\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`transactions\` ADD CONSTRAINT \`FK_e11180855c1afd8fe21f96a1bf8\` FOREIGN KEY (\`blockId\`) REFERENCES \`blocks\`(\`id\`) ON DELETE NO ACTION ON UPDATE CASCADE`,
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
