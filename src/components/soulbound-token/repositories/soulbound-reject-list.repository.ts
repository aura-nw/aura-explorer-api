import { EntityRepository, Repository } from 'typeorm';
import { SoulboundRejectList } from '../../../shared/entities/soulbound-reject-list.entity';

@EntityRepository(SoulboundRejectList)
export class SoulboundRejectListRepository extends Repository<SoulboundRejectList> {}
