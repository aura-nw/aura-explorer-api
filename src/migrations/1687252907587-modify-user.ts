import { MigrationInterface, QueryRunner } from 'typeorm';

export class modifyUser1687252907587 implements MigrationInterface {
  name = 'modifyUser1687252907587';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`name_tag\` ADD \`view_type\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`name_tag\` ADD \`note\` varchar(500) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`name_tag\` ADD \`created_by\` int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`name_tag\` DROP COLUMN \`name_tag\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`name_tag\` ADD \`name_tag\` varchar(35) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`name_tag\` CHANGE \`deleted_at\` \`deleted_at\` timestamp(6) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`name_tag\` DROP INDEX \`IDX_bdf80a3b3305f61f4450d8a4c9\``,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`IDX_dbfc3d415e2bab534451ee3bd1\` ON \`name_tag\` (\`address\`, \`created_by\`, \`view_type\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`name_tag\` ADD CONSTRAINT \`FK_b9acc92a3050fe81c6e24a80140\` FOREIGN KEY (\`created_by\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`name_tag\` DROP FOREIGN KEY \`FK_b9acc92a3050fe81c6e24a80140\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_8934c063470de8aa0ee2acae3c\` ON \`verify_code_step\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_a7b6f0620402cca904da746026\` ON \`soulbound_token\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_145a803764f97c98b71b9eeb80\` ON \`soulbound_token\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_f421fc385516e7a2136e92f755\` ON \`soulbound_token\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_dbfc3d415e2bab534451ee3bd1\` ON \`name_tag\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`validators\` DROP COLUMN \`bonded_height\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`validators\` ADD \`bonded_height\` float NOT NULL DEFAULT '1'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`transactions\` CHANGE \`fee\` \`fee\` decimal(30,6) NOT NULL DEFAULT '0.000000'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`transactions\` CHANGE \`amount\` \`amount\` decimal(30,6) NOT NULL DEFAULT '0.000000'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`transactions\` CHANGE \`to_address\` \`to_address\` varchar(255) NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE \`transactions\` CHANGE \`from_address\` \`from_address\` varchar(255) NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE \`transactions\` CHANGE \`contract_address\` \`contract_address\` varchar(255) NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE \`token_markets\` CHANGE \`description\` \`description\` text NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`token_markets\` CHANGE \`image\` \`image\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`token_markets\` CHANGE \`name\` \`name\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`token_markets\` CHANGE \`symbol\` \`symbol\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`token_markets\` DROP INDEX \`IDX_94264568c451f4f826938950ee\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`token_markets\` CHANGE \`contract_address\` \`contract_address\` varchar(255) NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`tags\` DROP COLUMN \`note\``);
    await queryRunner.query(
      `ALTER TABLE \`tags\` ADD \`note\` varchar(500) NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`tags\` DROP COLUMN \`tag\``);
    await queryRunner.query(
      `ALTER TABLE \`tags\` ADD \`tag\` varchar(35) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`soulbound_white_list\` DROP INDEX \`IDX_9d77a96720022bd6269db946b8\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` CHANGE \`total_tx\` \`total_tx\` int NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` CHANGE \`decimals\` \`decimals\` int NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` CHANGE \`description\` \`description\` text NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` CHANGE \`image\` \`image\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` DROP COLUMN \`num_tokens\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` ADD \`num_tokens\` bigint NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` CHANGE \`token_symbol\` \`token_symbol\` varchar(255) NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` CHANGE \`token_name\` \`token_name\` varchar(255) NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` CHANGE \`reference_code_id\` \`reference_code_id\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` CHANGE \`s3_location\` \`s3_location\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` CHANGE \`contract_match\` \`contract_match\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` CHANGE \`verified_at\` \`verified_at\` timestamp(6) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contract_codes\` CHANGE \`result\` \`result\` varchar(255) NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE \`smart_contract_codes\` CHANGE \`type\` \`type\` varchar(255) NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE \`name_tag\` CHANGE \`deleted_at\` \`deleted_at\` timestamp(0) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`name_tag\` DROP COLUMN \`name_tag\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`name_tag\` ADD \`name_tag\` varchar(255) CHARACTER SET "utf8mb3" COLLATE "utf8mb3_bin" NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`provider\` \`provider\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`role\` \`role\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`deployment_requests\` CHANGE \`official_project_website\` \`official_project_website\` text NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`deployment_requests\` CHANGE \`contract_description\` \`contract_description\` text NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`delegator_rewards\` DROP COLUMN \`amount\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`delegator_rewards\` ADD \`amount\` bigint NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`delegations\` DROP COLUMN \`amount\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`delegations\` ADD \`amount\` decimal(30,6) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`cw20_token_owners\` DROP COLUMN \`percent_hold\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`cw20_token_owners\` ADD \`percent_hold\` float NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`cw20_token_owners\` DROP COLUMN \`balance\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`cw20_token_owners\` ADD \`balance\` decimal(30,6) NOT NULL DEFAULT '0.000000'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`blocks\` CHANGE \`json_data\` \`json_data\` json NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`blocks\` DROP COLUMN \`gas_wanted\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`blocks\` ADD \`gas_wanted\` int NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(`ALTER TABLE \`blocks\` DROP COLUMN \`gas_used\``);
    await queryRunner.query(
      `ALTER TABLE \`blocks\` ADD \`gas_used\` int NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`name_tag\` DROP COLUMN \`created_by\``,
    );
    await queryRunner.query(`ALTER TABLE \`name_tag\` DROP COLUMN \`note\``);
    await queryRunner.query(
      `ALTER TABLE \`name_tag\` DROP COLUMN \`view_type\``,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`IDX_fa458264239bcc7e86f4acbd78\` ON \`verify_code_step\` (\`code_id\`, \`check_id\`)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`operator_address\` ON \`validators\` (\`operator_address\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`idx_to_address\` ON \`transactions\` (\`to_address\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`idx_timestamp\` ON \`transactions\` (\`timestamp\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`idx_from_address\` ON \`transactions\` (\`from_address\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`idx_contract_address\` ON \`transactions\` (\`contract_address\`)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`IDX_94264568c451f4f826938950ee\` ON \`token_markets\` (\`contract_address\`)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`IDX_a126fe2d41ab919b3527527229\` ON \`soulbound_white_list\` (\`account_address\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`IDX_980291b3c42833e42d0ebb4c92\` ON \`soulbound_token\` (\`contract_address\`)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`IDX_145a803764f97c98b71b9eeb80\` ON \`soulbound_token\` (\`token_id\`, \`contract_address\`)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`contract_address\` ON \`smart_contracts\` (\`contract_address\`)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`code_id\` ON \`smart_contract_codes\` (\`code_id\`)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`IDX_bdf80a3b3305f61f4450d8a4c9\` ON \`name_tag\` (\`address\`)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`IDX_48232194001651d584dbff792d\` ON \`name_tag\` (\`name_tag\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`blocks_idx_operator_address\` ON \`blocks\` (\`operator_address\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`blocks_idx_height\` ON \`blocks\` (\`height\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`block_sync_error_idx_height\` ON \`block_sync_error\` (\`height\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`name_tag\` ADD CONSTRAINT \`FK_xttt5ak2duc449574450s212er\` FOREIGN KEY (\`updated_by\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
