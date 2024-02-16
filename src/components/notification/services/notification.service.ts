import { Injectable } from '@nestjs/common';
import { AkcLogger, RequestContext, USER_ACTIVITIES } from '../../../shared';
import { NotificationRepository } from '../../queues/notification/repositories/notification.repository';
import { NotificationParamsDto } from '../dtos/get-notification-param.dto';
import { Repository, UpdateResult } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserActivity } from '../../../shared/entities/user-activity.entity';
import { Explorer } from 'src/shared/entities/explorer.entity';

@Injectable()
export class NotificationService {
  constructor(
    private readonly logger: AkcLogger,
    private notificationRepository: NotificationRepository,
    @InjectRepository(UserActivity)
    private userActivityRepository: Repository<UserActivity>,
    @InjectRepository(Explorer)
    private explorerRepository: Repository<Explorer>,
  ) {}

  async getNotifications(ctx: RequestContext, param: NotificationParamsDto) {
    this.logger.log(ctx, `${this.getNotifications.name} was called!`);

    const explorer = await this.explorerRepository.findOneOrFail({
      chainId: ctx.chainId,
    });

    return await this.notificationRepository.getNotifications(
      ctx.user.id,
      explorer?.id,
      param,
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
    const explorer = await this.explorerRepository.findOneOrFail({
      chainId: ctx.chainId,
    });
    return await this.notificationRepository.update(
      { user_id: ctx.user.id, explorer: { id: explorer?.id }, is_read: false },
      { is_read: true },
    );
  }

  async getDailyQuotaNotification(ctx: RequestContext): Promise<UserActivity> {
    this.logger.log(ctx, `${this.getDailyQuotaNotification.name} was called!`);
    const explorer = await this.explorerRepository.findOneOrFail({
      chainId: ctx.chainId,
    });
    const userActivities = await this.userActivityRepository.findOne({
      where: {
        user: { id: ctx.user.id },
        explorer: { id: explorer?.id },
        type: USER_ACTIVITIES.DAILY_NOTIFICATIONS,
      },
    });

    return userActivities;
  }
}
