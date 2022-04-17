import { EntityRepository, Repository } from 'typeorm';

import { Delegation, Validator } from '../../../shared';

@EntityRepository(Delegation)
export class DelegationRepository extends Repository<Delegation> {

}
