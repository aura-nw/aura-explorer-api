import {MigrationInterface, QueryRunner} from "typeorm";

export class transactionCreateIndex1661483207924 implements MigrationInterface {
    name = 'transactionCreateIndex1661483207924'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE UNIQUE INDEX \`TRANSACTION_TYPE_IDX\` ON \`transactions\` (\`type\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`TRANSACTION_MESSAGES_IDX\` ON \`transactions\``);
    }

}
