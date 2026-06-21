import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;

  const mockRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
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

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toEqual({ data: 'Ok' });
    });

    it('should throw an exception if email is already registered', async () => {
      mockRepository.findOne.mockResolvedValue({
        id: 1,
        email: 'eko@example.com',
      });

      await expect(service.register(registerDto)).rejects.toThrow(
        new HttpException(
          { error: 'Email sudah terdaftar' },
          HttpStatus.BAD_REQUEST,
        ),
      );

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'eko@example.com',
      password: 'password123',
    };

    it('should successfully login and return a token', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const mockUser = {
        id: 1,
        name: 'Eko',
        email: 'eko@example.com',
        password: hashedPassword,
      };

      mockRepository.findOne.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue('mocked_jwt_token');

      const result = await service.login(loginDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(mockJwtService.signAsync).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
      });
      expect(result).toEqual({ data: { token: 'mocked_jwt_token' } });
    });

    it('should throw an exception if email is not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        new HttpException(
          { error: 'Email atau password salah' },
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should throw an exception if password does not match', async () => {
      const hashedPassword = await bcrypt.hash('different_password', 10);
      const mockUser = {
        id: 1,
        name: 'Eko',
        email: 'eko@example.com',
        password: hashedPassword,
      };

      mockRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.login(loginDto)).rejects.toThrow(
        new HttpException(
          { error: 'Email atau password salah' },
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should throw an exception if email or password is empty', async () => {
      await expect(
        service.login({ email: '', password: 'password123' }),
      ).rejects.toThrow(
        new HttpException(
          { error: 'Email atau password salah' },
          HttpStatus.BAD_REQUEST,
        ),
      );

      await expect(
        service.login({ email: 'eko@example.com', password: '' }),
      ).rejects.toThrow(
        new HttpException(
          { error: 'Email atau password salah' },
          HttpStatus.BAD_REQUEST,
        ),
      );
    });
  });
});
