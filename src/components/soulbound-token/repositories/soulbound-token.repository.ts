import { EntityRepository, Repository } from "typeorm";
import { SoulboundToken } from "../../../shared";


@EntityRepository(SoulboundToken)
export class SoulboundTokenRepository extends Repository<SoulboundToken>{
}