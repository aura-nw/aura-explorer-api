import { Test, TestingModule } from '@nestjs/testing';
import { UserAuthorityService } from './user-authority.service';

describe('UserAuthorityService', () => {
  let service: UserAuthorityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserAuthorityService],
    }).compile();

    service = module.get<UserAuthorityService>(UserAuthorityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
