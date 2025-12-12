import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../../../../src/modules/account/users/users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../../../../src/modules/account/users/user.entity';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const mockRepo = {
      find: jest.fn(),
      findOneBy: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn().mockImplementation((dto) => dto),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
