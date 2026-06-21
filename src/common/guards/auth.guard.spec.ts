import { AuthGuard } from './auth.guard';
import { JwtService } from '@nestjs/jwt';
import { ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let jwtService: JwtService;

  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true if token is valid', async () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer valid_token',
        },
      };
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as unknown as ExecutionContext;

      mockJwtService.verifyAsync.mockResolvedValue({ id: 1 });

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect((mockRequest as { user?: any }).user).toEqual({ id: 1 });
    });

    it('should throw Unauthorized if token is missing', async () => {
      const mockRequest = {
        headers: {},
      };
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as unknown as ExecutionContext;

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        new HttpException({ error: 'Unauthorized' }, HttpStatus.UNAUTHORIZED),
      );
    });

    it('should throw Unauthorized if token is invalid', async () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer invalid_token',
        },
      };
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as unknown as ExecutionContext;

      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        new HttpException({ error: 'Unauthorized' }, HttpStatus.UNAUTHORIZED),
      );
    });
  });
});
