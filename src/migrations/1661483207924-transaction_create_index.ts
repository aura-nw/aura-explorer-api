import {MigrationInterface, QueryRunner} from "typeorm";

export class transactionCreateIndex1661483207924 implements MigrationInterface {
    name = 'transactionCreateIndex1661483207924'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`transactions\`  ADD INDEX \`TRANSACTION_TYPE_IDX\` (\`type\` ASC) VISIBLE;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`TRANSACTION_MESSAGES_IDX\` ON \`transactions\``);
    }
}
