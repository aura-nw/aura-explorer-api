import { EntityRepository, Repository } from 'typeorm';
import { Notification } from '../../../../shared/entities/notification.entity';
import { Logger } from '@nestjs/common';
import { NotificationParamsDto } from '../../../notification/dtos/get-notification-param.dto';

@EntityRepository(Notification)
export class NotificationRepository extends Repository<Notification> {
  private readonly _logger = new Logger(NotificationRepository.name);

  /**
   * Get list notifications
   * @param user_id
   * @param is_read
   * @returns
   */
  async getNotifications(user_id: number, param: NotificationParamsDto) {
    this._logger.log(
      `============== ${this.getNotifications.name} was called! ==============`,
    );
    const builder = this.createQueryBuilder('noti')
      .select('noti.*')
      .where('noti.user_id = :user_id', { user_id });

    const _finalizeResult = async () => {
      const result = await builder
        .limit(param.limit)
        .offset(param.offset)
        .orderBy('noti.created_at', 'DESC')
        .getRawMany();

      const count = await builder.getCount();
      const countUnread = await this.count({
        where: {
          is_read: false,
          user_id: user_id,
        },
      });

      return { result, count, countUnread };
    };

    if (param.unread?.toString() === 'true') {
      builder.andWhere('noti.is_read = 0');
    }

    return await _finalizeResult();
  }

  async cleanUp(numOfDay: number) {
    const result = await this.createQueryBuilder()
      .delete()
      .where('created_at < (NOW() - INTERVAL :numOfDay DAY)', { numOfDay })
      .execute();

    return result.affected;
  }
}
