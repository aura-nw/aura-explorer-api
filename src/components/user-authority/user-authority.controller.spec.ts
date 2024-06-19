import { Test, TestingModule } from '@nestjs/testing';
import { UserAuthorityController } from './user-authority.controller';
import { UserAuthorityService } from './user-authority.service';

describe('UserAuthorityController', () => {
  let controller: UserAuthorityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserAuthorityController],
      providers: [UserAuthorityService],
    }).compile();

    controller = module.get<UserAuthorityController>(UserAuthorityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
