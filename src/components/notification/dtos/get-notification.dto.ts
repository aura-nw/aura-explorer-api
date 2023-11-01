import { ApiProperty } from '@nestjs/swagger';

export class NotificationAttributes {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'notification title' })
  title: string;

  @ApiProperty({
    example: {
      content: 'notification content',
      data: { adress: 'address', from: 'from', to: 'to' },
    },
  })
  body: JSON;

  @ApiProperty({ example: 'a2233aasyudddxtxulsnvkysdfffasapzr48sj7q0kpzl7zl' })
  token: string;

  @ApiProperty({
    example:
      'https://aura-explorer-assets.s3.ap-southeast-1.amazonaws.com/serenity-assets/images/notFoundNFT.png',
  })
  image: string;

  @ApiProperty({
    example: '994A4104AC85B72A5F9F6DA8810682CEFAA5AA8BDA3C91BEC2890BC9FEE7AAE0',
  })
  tx_hash: string;

  @ApiProperty({ example: 'EXECUTED' })
  type: string;

  @ApiProperty({ example: 1 })
  user_id: number;

  @ApiProperty({ example: false })
  is_read: boolean;
}

export class GetNotificationResult {
  @ApiProperty({ type: NotificationAttributes, isArray: true })
  data: NotificationAttributes[];
}
