import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateRequestTableAddSocialInfo1663140835842
  implements MigrationInterface
{
  name = 'updateRequestTableAddSocialInfo1663140835842';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`deployment_requests\` ADD \`wechat\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`deployment_requests\` ADD \`linkedin\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`deployment_requests\` ADD \`medium\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`deployment_requests\` ADD \`reddit\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`deployment_requests\` ADD \`slack\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`deployment_requests\` ADD \`bitcointalk\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`deployment_requests\` CHANGE \`project_sector\` \`project_sector\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`deployment_requests\` CHANGE \`whitepaper\` \`whitepaper\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`deployment_requests\` CHANGE \`github\` \`github\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`deployment_requests\` CHANGE \`telegram\` \`telegram\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`deployment_requests\` CHANGE \`discord\` \`discord\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`deployment_requests\` CHANGE \`facebook\` \`facebook\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`deployment_requests\` CHANGE \`twitter\` \`twitter\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`deployment_requests\` CHANGE \`reason\` \`reason\` varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`deployment_requests\` CHANGE \`reason\` \`reason\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`deployment_requests\` CHANGE \`twitter\` \`twitter\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`deployment_requests\` CHANGE \`facebook\` \`facebook\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`deployment_requests\` CHANGE \`discord\` \`discord\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`deployment_requests\` CHANGE \`telegram\` \`telegram\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`deployment_requests\` CHANGE \`github\` \`github\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`deployment_requests\` CHANGE \`whitepaper\` \`whitepaper\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`deployment_requests\` CHANGE \`project_sector\` \`project_sector\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`deployment_requests\` DROP COLUMN \`bitcointalk\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`deployment_requests\` DROP COLUMN \`slack\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`deployment_requests\` DROP COLUMN \`reddit\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`deployment_requests\` DROP COLUMN \`medium\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`deployment_requests\` DROP COLUMN \`linkedin\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`deployment_requests\` DROP COLUMN \`wechat\``,
    );
  }
}
