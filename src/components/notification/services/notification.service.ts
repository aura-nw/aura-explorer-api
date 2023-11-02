import { Injectable } from '@nestjs/common';
import { AkcLogger, RequestContext } from '../../../shared';
import { NotificationRepository } from '../../queues/notification/repositories/notification.repository';
import { NotificationParamsDto } from '../dtos/get-notification-param.dto';
import { UpdateResult } from 'typeorm';

@Injectable()
export class NotificationService {
  constructor(
    private readonly logger: AkcLogger,
    private notificationRepository: NotificationRepository,
  ) {}

  async getNotifications(ctx: RequestContext, param: NotificationParamsDto) {
    this.logger.log(ctx, `${this.getNotifications.name} was called!`);

    return await this.notificationRepository.getNotifications(
      ctx.user.id,
      param.unread,
    );
  }

  async readNotification(
    ctx: RequestContext,
    id: number,
  ): Promise<UpdateResult> {
    this.logger.log(ctx, `${this.readNotification.name} was called!`);
    return await this.notificationRepository.update(id, { is_read: true });
  }

  async readAllNotification(ctx: RequestContext): Promise<UpdateResult> {
    this.logger.log(ctx, `${this.readNotification.name} was called!`);
    return await this.notificationRepository.update(
      { user_id: ctx?.user?.id, is_read: false },
      { is_read: true },
    );
  }
}
