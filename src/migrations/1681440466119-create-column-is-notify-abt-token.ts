import { MigrationInterface, QueryRunner } from 'typeorm';

export class createColumnIsNotifyAbtToken1681440466119
  implements MigrationInterface
{
  name = 'createColumnIsNotifyAbtToken1681440466119';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`soulbound_token\` ADD \`is_notify\` tinyint NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE \`soulbound_token\` CHANGE \`status\` \`status\` enum ('Unclaimed', 'Equipped', 'Unequipped', 'Pending', 'Reject') NOT NULL DEFAULT 'Unclaimed'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`soulbound_token\` CHANGE \`status\` \`status\` enum ('Unclaimed', 'Equipped', 'Unequipped', 'Pending') NOT NULL DEFAULT 'Unclaimed'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`soulbound_token\` DROP COLUMN \`is_notify\``,
    );
  }
}
