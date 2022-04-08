import { Injectable } from "@nestjs/common";
import { AkcLogger } from "../../../shared";
import { BlockSyncErrorRepository } from "../repositories/block-sync-error.repository";

@Injectable()
export class BlockSyncErrorService {
 
  constructor(
    private readonly logger: AkcLogger,
    private readonly blockSyncErrorRepos: BlockSyncErrorRepository
  ) {
    this.logger.setContext(BlockSyncErrorService.name);
  }

}
