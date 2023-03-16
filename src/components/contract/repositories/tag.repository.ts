import { Tag } from "../../../shared/entities/tag.entity";
import { EntityRepository, ObjectLiteral, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

@EntityRepository(Tag)
export class TagRepository extends Repository<Tag> {
    constructor(@InjectRepository(Tag) private readonly repos: Repository<ObjectLiteral>) {
        super();
    }
}