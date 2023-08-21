import {MigrationInterface, QueryRunner} from "typeorm";

export class createPrivateNameTag1692590250927 implements MigrationInterface {
    name = 'createPrivateNameTag1692590250927'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`cipher_keys\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`cipher_text\` text NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`private_name_tag\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`type\` varchar(255) NOT NULL, \`name_tag\` text NOT NULL, \`note\` varchar(500) NULL, \`address\` varchar(255) NOT NULL, \`created_by\` int NOT NULL, UNIQUE INDEX \`IDX_48e62ba1559c6bf12df8a0c6d7\` (\`address\`, \`created_by\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_activity\` DROP FOREIGN KEY \`FK_11108754ec780c670440e32baad\``);
        await queryRunner.query(`DROP TABLE \`verify_item_check\``);
        await queryRunner.query(`DROP INDEX \`IDX_8934c063470de8aa0ee2acae3c\` ON \`verify_code_step\``);
        await queryRunner.query(`DROP TABLE \`verify_code_step\``);
        await queryRunner.query(`DROP TABLE \`validators\``);
        await queryRunner.query(`DROP TABLE \`user_activity\``);
        await queryRunner.query(`DROP INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` ON \`user\``);
        await queryRunner.query(`DROP TABLE \`user\``);
        await queryRunner.query(`DROP TABLE \`transactions\``);
        await queryRunner.query(`DROP INDEX \`IDX_94264568c451f4f826938950ee\` ON \`token_markets\``);
        await queryRunner.query(`DROP INDEX \`IDX_13fee55b87572c6f4ce57d54b2\` ON \`token_markets\``);
        await queryRunner.query(`DROP INDEX \`IDX_94264568c451f4f826938950ee\` ON \`token_markets\``);
        await queryRunner.query(`DROP TABLE \`token_markets\``);
        await queryRunner.query(`DROP INDEX \`IDX_67afa205619f78463124b44380\` ON \`tags\``);
        await queryRunner.query(`DROP TABLE \`tags\``);
        await queryRunner.query(`DROP TABLE \`sync_status\``);
        await queryRunner.query(`DROP INDEX \`IDX_9d77a96720022bd6269db946b8\` ON \`soulbound_white_list\``);
        await queryRunner.query(`DROP TABLE \`soulbound_white_list\``);
        await queryRunner.query(`DROP INDEX \`IDX_a7b6f0620402cca904da746026\` ON \`soulbound_token\``);
        await queryRunner.query(`DROP INDEX \`IDX_255881ce0014160963f7ac3c0f\` ON \`soulbound_token\``);
        await queryRunner.query(`DROP INDEX \`IDX_145a803764f97c98b71b9eeb80\` ON \`soulbound_token\``);
        await queryRunner.query(`DROP INDEX \`IDX_f421fc385516e7a2136e92f755\` ON \`soulbound_token\``);
        await queryRunner.query(`DROP TABLE \`soulbound_token\``);
        await queryRunner.query(`DROP TABLE \`soulbound_reject_list\``);
        await queryRunner.query(`DROP INDEX \`IDX_048b937bd9e214c811118593ff\` ON \`smart_contracts\``);
        await queryRunner.query(`DROP TABLE \`smart_contracts\``);
        await queryRunner.query(`DROP TABLE \`smart_contract_codes\``);
        await queryRunner.query(`DROP INDEX \`IDX_c8baf92d2c653075f63554301d\` ON \`public_name_tag\``);
        await queryRunner.query(`DROP INDEX \`IDX_fd2f635611df945e7cb4735d25\` ON \`public_name_tag\``);
        await queryRunner.query(`DROP TABLE \`public_name_tag\``);
        await queryRunner.query(`DROP INDEX \`IDX_215d2f862627e4a73384af9671\` ON \`proposal_votes\``);
        await queryRunner.query(`DROP TABLE \`proposal_votes\``);
        await queryRunner.query(`DROP INDEX \`IDX_48e62ba1559c6bf12df8a0c6d7\` ON \`private_name_tag\``);
        await queryRunner.query(`DROP TABLE \`private_name_tag\``);
        await queryRunner.query(`DROP TABLE \`missed_block\``);
        await queryRunner.query(`DROP TABLE \`deployment_requests\``);
        await queryRunner.query(`DROP INDEX \`IDX_106c954bfc59f5e3e23f5f8490\` ON \`delegator_rewards\``);
        await queryRunner.query(`DROP TABLE \`delegator_rewards\``);
        await queryRunner.query(`DROP INDEX \`IDX_7ff3dbad33d546ab7cbee99ee2\` ON \`delegations\``);
        await queryRunner.query(`DROP TABLE \`delegations\``);
        await queryRunner.query(`DROP INDEX \`IDX_f6f5848559b7eb399b101feae3\` ON \`cw20_token_owners\``);
        await queryRunner.query(`DROP TABLE \`cw20_token_owners\``);
        await queryRunner.query(`DROP TABLE \`cipher_keys\``);
        await queryRunner.query(`DROP INDEX \`block_hash\` ON \`blocks\``);
        await queryRunner.query(`DROP TABLE \`blocks\``);
        await queryRunner.query(`DROP INDEX \`IDX_9be3ae38e660bae3059ad19e48\` ON \`block_sync_error\``);
        await queryRunner.query(`DROP TABLE \`block_sync_error\``);
    }

}
