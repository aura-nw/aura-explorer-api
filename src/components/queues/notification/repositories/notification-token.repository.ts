import { EntityRepository, Repository } from 'typeorm';
import { NotificationToken } from '../../../../shared/entities/notification-token.entity';

@EntityRepository(NotificationToken)
export class NotificationTokenRepository extends Repository<NotificationToken> {}
