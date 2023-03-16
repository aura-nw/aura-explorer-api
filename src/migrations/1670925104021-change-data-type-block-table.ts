import { MigrationInterface, QueryRunner } from 'typeorm';

export class changeDataTypeBlockTable1670925104021
  implements MigrationInterface
{
  name = 'changeDataTypeBlockTable1670925104021';

  public async up(queryRunner: QueryRunner): Promise<void> {
    //   await queryRunner.query(`ALTER TABLE \`blocks\` CHANGE COLUMN \`gas_used\` \`gas_used\` BIGINT NOT NULL DEFAULT '0'`);
    //   await queryRunner.query(`ALTER TABLE \`blocks\` CHANGE COLUMN \`gas_wanted\` \`gas_wanted\` BIGINT NOT NULL DEFAULT '0'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //   await queryRunner.query(`ALTER TABLE \`blocks\` CHANGE COLUMN \`gas_used\` \`gas_used\` INT NOT NULL DEFAULT '0'`);
    //   await queryRunner.query(`ALTER TABLE \`blocks\` CHANGE COLUMN \`gas_wanted\` \`gas_wanted\` INT NOT NULL DEFAULT '0'`);
  }
}
