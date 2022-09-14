import {MigrationInterface, QueryRunner} from "typeorm";

export class dropTableTokenTransactions1662976687889 implements MigrationInterface {
    name = 'dropTableTokenTransactions1662976687889'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`token_transactions\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> { }

}
