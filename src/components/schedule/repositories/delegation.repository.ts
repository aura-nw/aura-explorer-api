import { EntityRepository, Repository } from 'typeorm';

import { Delegation } from '../../../shared';

@EntityRepository(Delegation)
export class DelegationRepository extends Repository<Delegation> {}
