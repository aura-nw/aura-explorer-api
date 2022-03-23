import {MigrationInterface, QueryRunner} from "typeorm";

export class validatorDelegation1648007881309 implements MigrationInterface {
    name = 'validatorDelegation1648007881309'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // await queryRunner.query(`CREATE TABLE \`delegation\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`delegator_address\` varchar(255) NOT NULL, \`validator_address\` varchar(255) NOT NULL DEFAULT '', \`shares\` varchar(255) NOT NULL DEFAULT '', \`amount\` float NOT NULL, UNIQUE INDEX \`delegator_address\` (\`delegator_address\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        // await queryRunner.query(`CREATE TABLE \`validators\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`operator_address\` varchar(255) NOT NULL, \`acc_address\` varchar(255) NOT NULL DEFAULT '', \`cons_address\` varchar(255) NOT NULL DEFAULT '', \`cons_pub_key\` varchar(255) NOT NULL DEFAULT '', \`title\` varchar(255) NOT NULL DEFAULT '', \`jailed\` varchar(255) NOT NULL DEFAULT '', \`commission\` text NOT NULL, \`max_commission\` text NOT NULL, \`max_change_rate\` text NOT NULL, \`min_self_delegation\` int NOT NULL DEFAULT '0', \`delegator_shares\` text NOT NULL, \`power\` float NOT NULL, \`percent_power\` varchar(255) NOT NULL DEFAULT '', \`self_bonded\` float NOT NULL, \`percent_self_bonded\` varchar(255) NOT NULL DEFAULT '', \`website\` varchar(255) NOT NULL DEFAULT '', \`details\` varchar(255) NOT NULL DEFAULT '', \`identity\` varchar(255) NOT NULL DEFAULT '', \`unbonding_height\` varchar(255) NOT NULL DEFAULT '', \`unbonding_time\` datetime NOT NULL, \`update_time\` datetime NOT NULL, \`up_time\` varchar(255) NOT NULL DEFAULT '0', UNIQUE INDEX \`operator_address\` (\`operator_address\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`transactions\` DROP COLUMN \`raw_log\``);
        await queryRunner.query(`ALTER TABLE \`transactions\` ADD \`raw_log\` json NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // await queryRunner.query(`DROP INDEX \`operator_address\` ON \`validators\``);
        // await queryRunner.query(`DROP TABLE \`validators\``);
        // await queryRunner.query(`DROP INDEX \`delegator_address\` ON \`delegation\``);
        // await queryRunner.query(`DROP TABLE \`delegation\``);
        await queryRunner.query(`ALTER TABLE \`transactions\` DROP COLUMN \`raw_log\``);
        await queryRunner.query(`ALTER TABLE \`transactions\` ADD \`raw_log\` text NOT NULL`);
    }

}
