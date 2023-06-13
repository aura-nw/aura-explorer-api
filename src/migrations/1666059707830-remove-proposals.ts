import { MigrationInterface, QueryRunner } from 'typeorm';

export class removeProposals1666059707830 implements MigrationInterface {
  name = 'removeProposals1666059707830';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`proposals\``);
    await queryRunner.query(`DROP TABLE \`proposal_deposits\``);
    await queryRunner.query(`DROP TABLE \`history_proposals\``);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
