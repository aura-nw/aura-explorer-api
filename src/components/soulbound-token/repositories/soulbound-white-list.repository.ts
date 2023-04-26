import { EntityRepository, Repository } from 'typeorm';
import { SoulboundWhiteList } from '../../../shared/entities/soulbound-white-list.entity';

@EntityRepository(SoulboundWhiteList)
export class SoulboundWhiteListRepository extends Repository<SoulboundWhiteList> {}
