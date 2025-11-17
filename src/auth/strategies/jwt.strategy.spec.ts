import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    mockConfigService.get.mockReturnValue('test-jwt-secret');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should extract JWT secret from config service', () => {
    expect(configService.get).toHaveBeenCalledWith('JWT_SECRET');
  });

  describe('validate', () => {
    it('should validate and return user data from JWT payload', async () => {
      const payload = {
        sub: 'api-user',
        role: 'admin',
        iat: 1234567890,
      };

      const result = await strategy.validate(payload);

      expect(result).toEqual({
        userId: 'api-user',
        role: 'admin',
      });
    });

    it('should handle different user IDs', async () => {
      const payload = {
        sub: 'test-user-123',
        role: 'user',
      };

      const result = await strategy.validate(payload);

      expect(result.userId).toBe('test-user-123');
      expect(result.role).toBe('user');
    });

    it('should extract userId from sub property', async () => {
      const payload = {
        sub: 'unique-user-id',
        role: 'superadmin',
        iat: 9876543210,
      };

      const result = await strategy.validate(payload);

      expect(result).toHaveProperty('userId', 'unique-user-id');
      expect(result).toHaveProperty('role', 'superadmin');
    });
  });
});
