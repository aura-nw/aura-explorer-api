import { EntityRepository, Repository } from 'typeorm';
import { Notification } from '../../../../shared/entities/notification.entity';
import { Logger } from '@nestjs/common';

@EntityRepository(Notification)
export class NotificationRepository extends Repository<Notification> {
  private readonly _logger = new Logger(NotificationRepository.name);

  /**
   * Get list notificaion
   * @param user_id
   * @param is_read
   * @returns
   */
  async getNotifications(user_id: number, unread: boolean) {
    this._logger.log(
      `============== ${this.getNotifications.name} was called! ==============`,
    );
    const builder = this.createQueryBuilder('noti')
      .select(`noti.*`)
      .where('noti.user_id = :user_id', { user_id });

    const _finalizeResult = async () => {
      const result = await builder
        .orderBy('noti.created_at', 'DESC')
        .getRawMany();

      const count = await builder.getCount();

      return { result, count };
    };

    if (unread === true || unread.toString() === 'true') {
      builder.andWhere('noti.is_read = 0');
    }

    return await _finalizeResult();
  }
}
