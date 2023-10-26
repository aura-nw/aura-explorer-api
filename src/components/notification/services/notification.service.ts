import { Injectable } from '@nestjs/common';
import { AkcLogger, RequestContext } from '../../../shared';
import { NotificationRepository } from '../../queues/notification/repositories/notification.repository';
import { NotificationParamsDto } from '../dtos/get-notification-param.dto';

@Injectable()
export class NotificationService {
  constructor(
    private readonly logger: AkcLogger,
    private notificationRepository: NotificationRepository,
  ) {}

  async getNotifications(ctx: RequestContext, param: NotificationParamsDto) {
    this.logger.log(ctx, `${this.getNotifications.name} was called!`);

    return await this.notificationRepository.getNotifications(
      param.userId,
      param.isRead,
    );
  }
}
