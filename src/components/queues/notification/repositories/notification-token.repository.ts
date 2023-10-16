import { EntityRepository, Repository } from 'typeorm';
import { NotificationToken } from '../../../../shared/entities/notification-token.enitity';

@EntityRepository(NotificationToken)
export class NotificationTokenRepository extends Repository<NotificationToken> {}
