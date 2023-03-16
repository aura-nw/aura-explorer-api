import {MigrationInterface, QueryRunner} from "typeorm";

export class changeTypeColumnPower1652343878658 implements MigrationInterface {
    name = 'changeTypeColumnPower1652343878658'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`validators\` CHANGE \`power\` \`power\` double NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        
    }

}
