import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtService } from '@nestjs/jwt';

describe('UsersController', () => {
  let controller: UsersController;

  const mockUsersService = {
    register: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
  };

  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call service.register and return the result', async () => {
      const registerDto = {
        name: 'Eko',
        email: 'eko@example.com',
        password: 'password123',
      };
      const expectedResult = { data: 'Ok' };
      mockUsersService.register.mockResolvedValue(expectedResult);

      const result = await controller.register(registerDto);

      expect(mockUsersService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('login', () => {
    it('should call service.login and return the token result', async () => {
      const loginDto = {
        email: 'eko@example.com',
        password: 'password123',
      };
      const expectedResult = {
        data: {
          token: 'mocked_jwt_token',
        },
      };
      mockUsersService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(loginDto);

      expect(mockUsersService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('logout', () => {
    it('should call service.logout and return Ok', async () => {
      const expectedResult = { data: 'Ok' };
      mockUsersService.logout.mockResolvedValue(expectedResult);

      const result = await controller.logout();

      expect(mockUsersService.logout).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });
}
);
