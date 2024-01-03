import { MigrationInterface, QueryRunner } from 'typeorm';

export class createTables1704251256151 implements MigrationInterface {
  name = 'createTables1704251256151';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`chain_info\` (
        \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`chain_id\` varchar(255) COLLATE utf8mb4_bin NOT NULL,
        \`chain_name\` varchar(255) COLLATE utf8mb4_bin NOT NULL,
        \`chain_image\` varchar(255) COLLATE utf8mb4_bin NOT NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`IDX_ab5accf171432c687f0cf91edf\` (\`chain_id\`)
      ) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;`,
    );
    await queryRunner.query(
      `CREATE TABLE \`cipher_keys\` (
        \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`cipher_text\` text COLLATE utf8mb4_bin NOT NULL,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;`,
    );
    await queryRunner.query(
      `CREATE TABLE \`user\` (
          \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
          \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
          \`id\` int NOT NULL AUTO_INCREMENT,
          \`email\` varchar(255) COLLATE utf8mb4_bin NOT NULL,
          \`name\` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
          \`role\` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
          \`provider\` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
          \`encrypted_password\` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
          \`verification_token\` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
          \`verified_at\` datetime DEFAULT NULL,
          \`reset_password_token\` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
          \`last_required_login\` datetime DEFAULT NULL,
          PRIMARY KEY (\`id\`),
          UNIQUE KEY \`IDX_e12875dfb3b1d92d7d7c5377e2\` (\`email\`)
        ) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;`,
    );
    await queryRunner.query(
      `CREATE TABLE \`notification\` (
        \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`title\` varchar(255) COLLATE utf8mb4_bin NOT NULL,
        \`body\` json NOT NULL,
        \`image\` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
        \`tx_hash\` varchar(255) COLLATE utf8mb4_bin NOT NULL,
        \`type\` varchar(255) COLLATE utf8mb4_bin NOT NULL,
        \`user_id\` int NOT NULL,
        \`is_read\` tinyint NOT NULL DEFAULT '0',
        \`height\` int DEFAULT NULL,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB AUTO_INCREMENT=953 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
      `,
    );
    await queryRunner.query(
      `CREATE TABLE \`notification_token\` (
        \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`notification_token\` varchar(255) COLLATE utf8mb4_bin NOT NULL,
        \`status\` varchar(255) COLLATE utf8mb4_bin NOT NULL DEFAULT 'ACTIVE',
        \`user_id\` int DEFAULT NULL,
        PRIMARY KEY (\`id\`),
        KEY \`FK_9946abba87be50041606b8c5646\` (\`user_id\`),
        CONSTRAINT \`FK_9946abba87be50041606b8c5646\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;`,
    );
    await queryRunner.query(
      `CREATE TABLE \`private_name_tag\` (
        \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`type\` varchar(255) COLLATE utf8mb4_bin NOT NULL,
        \`name_tag\` text COLLATE utf8mb4_bin NOT NULL,
        \`note\` varchar(500) COLLATE utf8mb4_bin DEFAULT NULL,
        \`address\` varchar(255) COLLATE utf8mb4_bin NOT NULL,
        \`created_by\` int NOT NULL,
        \`is_favorite\` tinyint NOT NULL DEFAULT '0',
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`IDX_48e62ba1559c6bf12df8a0c6d7\` (\`address\`,\`created_by\`)
      ) ENGINE=InnoDB AUTO_INCREMENT=223 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;`,
    );
    await queryRunner.query(
      `CREATE TABLE \`public_name_tag\` (
        \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`type\` varchar(255) COLLATE utf8mb4_bin NOT NULL,
        \`name_tag\` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
        \`address\` varchar(255) COLLATE utf8mb4_bin NOT NULL,
        \`updated_by\` int NOT NULL,
        \`enterprise_url\` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`IDX_bdf80a3b3305f61f4450d8a4c9\` (\`address\`),
        UNIQUE KEY \`IDX_48232194001651d584dbff792d\` (\`name_tag\`),
        KEY \`FK_xttt5ak2duc449574450s212er\` (\`updated_by\`),
        CONSTRAINT \`FK_xttt5ak2duc449574450s212er\` FOREIGN KEY (\`updated_by\`) REFERENCES \`user\` (\`id\`)
      ) ENGINE=InnoDB AUTO_INCREMENT=90 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;`,
    );
    await queryRunner.query(
      `CREATE TABLE \`soulbound_reject_list\` (
        \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`account_address\` varchar(255) COLLATE utf8mb4_bin NOT NULL,
        \`reject_address\` varchar(255) COLLATE utf8mb4_bin NOT NULL,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;`,
    );
    await queryRunner.query(
      `CREATE TABLE \`soulbound_token\` (
        \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`contract_address\` varchar(255) COLLATE utf8mb4_bin NOT NULL,
        \`token_id\` varchar(255) COLLATE utf8mb4_bin NOT NULL,
        \`token_uri\` varchar(255) COLLATE utf8mb4_bin NOT NULL,
        \`token_name\` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
        \`token_img\` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
        \`img_type\` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
        \`animation_url\` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
        \`receiver_address\` varchar(255) COLLATE utf8mb4_bin NOT NULL,
        \`status\` enum('Unclaimed','Equipped','Unequipped','Pending','Rejected') COLLATE utf8mb4_bin NOT NULL DEFAULT 'Unclaimed',
        \`signature\` text COLLATE utf8mb4_bin NOT NULL,
        \`pub_key\` text COLLATE utf8mb4_bin NOT NULL,
        \`picked\` tinyint NOT NULL DEFAULT '0',
        \`is_notify\` tinyint NOT NULL DEFAULT '0',
        \`ipfs\` text COLLATE utf8mb4_bin,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`IDX_145a803764f97c98b71b9eeb80\` (\`token_id\`,\`contract_address\`),
        KEY \`IDX_980291b3c42833e42d0ebb4c92\` (\`contract_address\`),
        KEY \`IDX_255881ce0014160963f7ac3c0f\` (\`receiver_address\`)
      ) ENGINE=InnoDB AUTO_INCREMENT=184 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;`,
    );
    await queryRunner.query(
      `CREATE TABLE \`soulbound_white_list\` (
        \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`account_address\` varchar(255) COLLATE utf8mb4_bin NOT NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`IDX_a126fe2d41ab919b3527527229\` (\`account_address\`)
      ) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;`,
    );
    await queryRunner.query(
      `CREATE TABLE \`sync_point\` (
        \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`type\` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
        \`point\` int DEFAULT NULL,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;`,
    );
    await queryRunner.query(
      `CREATE TABLE \`token_markets\` (
        \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`contract_address\` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
        \`denom\` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
        \`coin_id\` varchar(255) COLLATE utf8mb4_bin NOT NULL DEFAULT '',
        \`symbol\` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
        \`name\` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
        \`description\` text COLLATE utf8mb4_bin,
        \`image\` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
        \`max_supply\` decimal(38,6) NOT NULL DEFAULT '0.000000',
        \`current_price\` decimal(38,6) NOT NULL DEFAULT '0.000000',
        \`price_change_percentage_24h\` float NOT NULL DEFAULT '0',
        \`total_volume\` decimal(38,6) NOT NULL DEFAULT '0.000000',
        \`circulating_supply\` decimal(38,6) NOT NULL DEFAULT '0.000000',
        \`circulating_market_cap\` decimal(38,6) NOT NULL DEFAULT '0.000000',
        \`market_cap\` decimal(38,6) NOT NULL DEFAULT '0.000000',
        \`fully_diluted_valuation\` decimal(38,6) NOT NULL DEFAULT '0.000000',
        \`verify_status\` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
        \`verify_text\` text COLLATE utf8mb4_bin,
        \`decimal\` int NOT NULL DEFAULT '0',
        \`chain_id\` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
        \`official_site\` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
        \`social_profiles\` json DEFAULT NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`IDX_94264568c451f4f826938950ee\` (\`contract_address\`),
        UNIQUE KEY \`IDX_ee5edec6c978e77465b00cf4e9\` (\`chain_id\`,\`denom\`)
      ) ENGINE=InnoDB AUTO_INCREMENT=101 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;`,
    );
    await queryRunner.query(
      `CREATE TABLE \`user_activity\` (
        \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`type\` varchar(255) COLLATE utf8mb4_bin NOT NULL,
        \`send_mail_attempt\` int DEFAULT '0',
        \`last_send_mail_attempt\` datetime DEFAULT NULL,
        \`user_id\` int DEFAULT NULL,
        \`total\` int DEFAULT '0',
        PRIMARY KEY (\`id\`),
        KEY \`FK_11108754ec780c670440e32baad\` (\`user_id\`),
        CONSTRAINT \`FK_11108754ec780c670440e32baad\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\` (\`id\`)
      ) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;`,
    );

    await queryRunner.query(
      `CREATE TABLE \`watch_list\` (
        \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`address\` varchar(255) COLLATE utf8mb4_bin NOT NULL,
        \`type\` enum('account','contract') COLLATE utf8mb4_bin NOT NULL,
        \`favorite\` tinyint NOT NULL DEFAULT '0',
        \`tracking\` tinyint NOT NULL DEFAULT '0',
        \`note\` varchar(200) COLLATE utf8mb4_bin DEFAULT '',
        \`settings\` json DEFAULT NULL,
        \`user_id\` int NOT NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`IDX_1ef4cbbd8b315a6f9a293d29cd\` (\`address\`,\`user_id\`),
        KEY \`FK_115e7508781f89fccc1fb652db5\` (\`user_id\`),
        CONSTRAINT \`FK_115e7508781f89fccc1fb652db5\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user_activity\` DROP FOREIGN KEY \`FK_11108754ec780c670440e32baad\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`notification_token\` DROP FOREIGN KEY \`FK_9946abba87be50041606b8c5646\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`watch_list\` DROP FOREIGN KEY \`FK_115e7508781f89fccc1fb652db5\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`public_name_tag\` DROP FOREIGN KEY \`FK_xttt5ak2duc449574450s212er\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_ab5accf171432c687f0cf91edf\` ON \`chain_info\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_48e62ba1559c6bf12df8a0c6d7\` ON \`private_name_tag\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_bdf80a3b3305f61f4450d8a4c9\` ON \`public_name_tag\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_48232194001651d584dbff792d\` ON \`public_name_tag\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_145a803764f97c98b71b9eeb80\` ON \`soulbound_token\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_980291b3c42833e42d0ebb4c92\` ON \`soulbound_token\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_255881ce0014160963f7ac3c0f\` ON \`soulbound_token\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_a126fe2d41ab919b3527527229\` ON \`soulbound_white_list\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_94264568c451f4f826938950ee\` ON \`token_markets\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_ee5edec6c978e77465b00cf4e9\` ON \`token_markets\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` ON \`user\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_1ef4cbbd8b315a6f9a293d29cd\` ON \`watch_list\``,
    );
    await queryRunner.query(`DROP TABLE \`chain_info\``);
    await queryRunner.query(`DROP TABLE \`cipher_keys\``);
    await queryRunner.query(`DROP TABLE \`notification\``);
    await queryRunner.query(`DROP TABLE \`notification_token\``);
    await queryRunner.query(`DROP TABLE \`private_name_tag\``);
    await queryRunner.query(`DROP TABLE \`public_name_tag\``);
    await queryRunner.query(`DROP TABLE \`soulbound_reject_list\``);
    await queryRunner.query(`DROP TABLE \`soulbound_token\``);
    await queryRunner.query(`DROP TABLE \`soulbound_white_list\``);
    await queryRunner.query(`DROP TABLE \`sync_point\``);
    await queryRunner.query(`DROP TABLE \`token_markets\``);
    await queryRunner.query(`DROP TABLE \`user\``);
  }
}
