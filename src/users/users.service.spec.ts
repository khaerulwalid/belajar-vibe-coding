import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let repo: Repository<User>;

  const mockRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto = {
      name: 'Eko',
      email: 'eko@example.com',
      password: 'password123',
    };

    it('should successfully register a user', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(registerDto);
      mockRepository.save.mockResolvedValue(registerDto);

      const result = await service.register(registerDto);

      expect(repo.findOne).toHaveBeenCalledWith({ where: { email: registerDto.email } });
      expect(repo.create).toHaveBeenCalled();
      expect(repo.save).toHaveBeenCalled();
      expect(result).toEqual({ data: 'Ok' });
    });

    it('should throw an exception if email is already registered', async () => {
      mockRepository.findOne.mockResolvedValue({ id: 1, email: 'eko@example.com' });

      await expect(service.register(registerDto)).rejects.toThrow(
        new HttpException({ error: 'Email sudah terdaftar' }, HttpStatus.BAD_REQUEST),
      );

      expect(repo.findOne).toHaveBeenCalledWith({ where: { email: registerDto.email } });
      expect(repo.create).not.toHaveBeenCalled();
      expect(repo.save).not.toHaveBeenCalled();
    });
  });
});
