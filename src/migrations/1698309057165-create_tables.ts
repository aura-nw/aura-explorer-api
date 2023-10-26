import {MigrationInterface, QueryRunner} from "typeorm";

export class createTables1698309057165 implements MigrationInterface {
    name = 'createTables1698309057165'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`cipher_keys\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`cipher_text\` text NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`cw20_token_owners\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`contract_address\` varchar(255) NOT NULL, \`owner\` varchar(255) NOT NULL, \`balance\` int NOT NULL, \`percent_hold\` int NOT NULL, UNIQUE INDEX \`IDX_f6f5848559b7eb399b101feae3\` (\`contract_address\`, \`owner\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`private_name_tag\` (\`id\` int NOT NULL AUTO_INCREMENT, \`type\` varchar(255) NOT NULL, \`is_favorite\` tinyint NOT NULL DEFAULT 0, \`name_tag\` text NOT NULL, \`note\` varchar(500) NULL, \`address\` varchar(255) NOT NULL, \`created_by\` int NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_48e62ba1559c6bf12df8a0c6d7\` (\`address\`, \`created_by\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`public_name_tag\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`type\` varchar(255) NOT NULL, \`name_tag\` varchar(255) NOT NULL, \`address\` varchar(255) NOT NULL, \`updated_by\` int NOT NULL, \`enterprise_url\` varchar(255) NULL, UNIQUE INDEX \`IDX_fd2f635611df945e7cb4735d25\` (\`address\`), UNIQUE INDEX \`IDX_c8baf92d2c653075f63554301d\` (\`name_tag\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`soulbound_reject_list\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`account_address\` varchar(255) NOT NULL, \`reject_address\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`soulbound_token\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`contract_address\` varchar(255) NOT NULL, \`token_id\` varchar(255) NOT NULL, \`token_uri\` varchar(255) NOT NULL, \`token_img\` varchar(255) NULL, \`img_type\` varchar(255) NULL, \`token_name\` varchar(255) NULL, \`animation_url\` varchar(255) NULL, \`receiver_address\` varchar(255) NOT NULL, \`status\` enum ('Unclaimed', 'Equipped', 'Unequipped', 'Pending', 'Rejected') NOT NULL DEFAULT 'Unclaimed', \`signature\` text NOT NULL, \`pub_key\` text NOT NULL, \`picked\` tinyint NOT NULL DEFAULT 0, \`is_notify\` tinyint NOT NULL DEFAULT 0, \`ipfs\` text NULL, INDEX \`IDX_f421fc385516e7a2136e92f755\` (\`contract_address\`), INDEX \`IDX_145a803764f97c98b71b9eeb80\` (\`token_id\`), INDEX \`IDX_255881ce0014160963f7ac3c0f\` (\`receiver_address\`), UNIQUE INDEX \`IDX_a7b6f0620402cca904da746026\` (\`contract_address\`, \`token_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`soulbound_white_list\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`account_address\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_9d77a96720022bd6269db946b8\` (\`account_address\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`sync_point\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`type\` varchar(255) NULL, \`point\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`token_markets\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`contract_address\` varchar(255) NOT NULL, \`coin_id\` varchar(255) NOT NULL, \`code_id\` int NOT NULL, \`symbol\` varchar(255) NOT NULL, \`name\` varchar(255) NOT NULL, \`image\` varchar(255) NOT NULL, \`max_supply\` decimal(38,6) NOT NULL DEFAULT '0.000000', \`current_price\` decimal(38,6) NOT NULL DEFAULT '0.000000', \`price_change_percentage_24h\` float NOT NULL DEFAULT '0', \`total_volume\` decimal(38,6) NOT NULL DEFAULT '0.000000', \`circulating_supply\` decimal(38,6) NOT NULL DEFAULT '0.000000', \`circulating_market_cap\` decimal(38,6) NOT NULL DEFAULT '0.000000', \`description\` text NOT NULL, \`market_cap\` decimal(38,6) NOT NULL DEFAULT '0.000000', \`fully_diluted_valuation\` decimal(38,6) NOT NULL DEFAULT '0.000000', \`verify_status\` varchar(255) NULL, \`verify_text\` varchar(255) NULL, \`denom\` varchar(255) NULL, \`decimal\` int NOT NULL DEFAULT '0', INDEX \`IDX_94264568c451f4f826938950ee\` (\`contract_address\`), INDEX \`IDX_13fee55b87572c6f4ce57d54b2\` (\`code_id\`), UNIQUE INDEX \`IDX_94264568c451f4f826938950ee\` (\`contract_address\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`email\` varchar(255) NOT NULL, \`name\` varchar(255) NULL, \`role\` varchar(255) NULL, \`provider\` varchar(255) NULL, \`encrypted_password\` varchar(255) NULL, \`verification_token\` varchar(255) NULL, \`verified_at\` datetime NULL, \`reset_password_token\` varchar(255) NULL, \`last_required_login\` datetime NULL, UNIQUE INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user_activity\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`type\` varchar(255) NOT NULL, \`send_mail_attempt\` int NULL DEFAULT '0', \`last_send_mail_attempt\` datetime NULL, \`user_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`user_activity\` ADD CONSTRAINT \`FK_11108754ec780c670440e32baad\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_activity\` DROP FOREIGN KEY \`FK_11108754ec780c670440e32baad\``);
        await queryRunner.query(`DROP TABLE \`user_activity\``);
        await queryRunner.query(`DROP INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` ON \`user\``);
        await queryRunner.query(`DROP TABLE \`user\``);
        await queryRunner.query(`DROP INDEX \`IDX_94264568c451f4f826938950ee\` ON \`token_markets\``);
        await queryRunner.query(`DROP INDEX \`IDX_13fee55b87572c6f4ce57d54b2\` ON \`token_markets\``);
        await queryRunner.query(`DROP INDEX \`IDX_94264568c451f4f826938950ee\` ON \`token_markets\``);
        await queryRunner.query(`DROP TABLE \`token_markets\``);
        await queryRunner.query(`DROP TABLE \`sync_point\``);
        await queryRunner.query(`DROP INDEX \`IDX_9d77a96720022bd6269db946b8\` ON \`soulbound_white_list\``);
        await queryRunner.query(`DROP TABLE \`soulbound_white_list\``);
        await queryRunner.query(`DROP INDEX \`IDX_a7b6f0620402cca904da746026\` ON \`soulbound_token\``);
        await queryRunner.query(`DROP INDEX \`IDX_255881ce0014160963f7ac3c0f\` ON \`soulbound_token\``);
        await queryRunner.query(`DROP INDEX \`IDX_145a803764f97c98b71b9eeb80\` ON \`soulbound_token\``);
        await queryRunner.query(`DROP INDEX \`IDX_f421fc385516e7a2136e92f755\` ON \`soulbound_token\``);
        await queryRunner.query(`DROP TABLE \`soulbound_token\``);
        await queryRunner.query(`DROP TABLE \`soulbound_reject_list\``);
        await queryRunner.query(`DROP INDEX \`IDX_c8baf92d2c653075f63554301d\` ON \`public_name_tag\``);
        await queryRunner.query(`DROP INDEX \`IDX_fd2f635611df945e7cb4735d25\` ON \`public_name_tag\``);
        await queryRunner.query(`DROP TABLE \`public_name_tag\``);
        await queryRunner.query(`DROP INDEX \`IDX_48e62ba1559c6bf12df8a0c6d7\` ON \`private_name_tag\``);
        await queryRunner.query(`DROP TABLE \`private_name_tag\``);
        await queryRunner.query(`DROP INDEX \`IDX_f6f5848559b7eb399b101feae3\` ON \`cw20_token_owners\``);
        await queryRunner.query(`DROP TABLE \`cw20_token_owners\``);
        await queryRunner.query(`DROP TABLE \`cipher_keys\``);
    }

}
