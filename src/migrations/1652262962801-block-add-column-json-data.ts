import {MigrationInterface, QueryRunner} from "typeorm";

export class blockAddColumnJsonData1652262962801 implements MigrationInterface {
    name = 'blockAddColumnJsonData1652262962801'

    public async up(queryRunner: QueryRunner): Promise<void> {       
        await queryRunner.query(`ALTER TABLE \`blocks\` ADD \`json_data\` json NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {        
    }

}
