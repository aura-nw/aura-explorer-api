import { MigrationInterface, QueryRunner } from 'typeorm';

export class dropTableNfts1662630196506 implements MigrationInterface {
  name = 'dropTableNfts1662630196506';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`nfts\``);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
