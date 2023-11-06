import { Injectable } from '@nestjs/common';
import { AkcLogger, RequestContext, USER_ACTIVITIES } from '../../../shared';
import { NotificationRepository } from '../../queues/notification/repositories/notification.repository';
import { NotificationParamsDto } from '../dtos/get-notification-param.dto';
import { Repository, UpdateResult } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserActivity } from '../../../shared/entities/user-activity.entity';

@Injectable()
export class NotificationService {
  constructor(
    private readonly logger: AkcLogger,
    private notificationRepository: NotificationRepository,
    @InjectRepository(UserActivity)
    private userActivityRepository: Repository<UserActivity>,
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
    return await this.notificationRepository.update(id, {
      user_id: ctx.user.id,
      is_read: true,
    });
  }

  async readAllNotification(ctx: RequestContext): Promise<UpdateResult> {
    this.logger.log(ctx, `${this.readAllNotification.name} was called!`);
    return await this.notificationRepository.update(
      { user_id: ctx.user.id, is_read: false },
      { is_read: true },
    );
  }

  async getDailyQuotaNotification(ctx: RequestContext) {
    this.logger.log(ctx, `${this.getDailyQuotaNotification.name} was called!`);

    const userActivities = await this.userActivityRepository.findOne({
      where: {
        user: { id: ctx.user.id },
        type: USER_ACTIVITIES.DAILY_NOTIFICATIONS,
      },
    });

    return userActivities?.total || 0;
  }
}
