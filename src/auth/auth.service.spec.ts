import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let _jwtService: JwtService;
  let _configService: ConfigService;

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    _jwtService = module.get<JwtService>(JwtService);
    _configService = module.get<ConfigService>(ConfigService);

    // Reset mocks
    jest.clearAllMocks();

    // Setup default config
    mockConfigService.get.mockReturnValue('test-api-key-123');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateToken', () => {
    it('should generate a JWT token with valid API key', async () => {
      const validApiKey = 'test-api-key-123';
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await service.generateToken(validApiKey);

      expect(result).toEqual({ access_token: mockToken });
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: 'api-user',
          role: 'admin',
          iat: expect.any(Number),
        }),
      );
    });

    it('should throw UnauthorizedException with invalid API key', async () => {
      const invalidApiKey = 'wrong-key';

      await expect(service.generateToken(invalidApiKey)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.generateToken(invalidApiKey)).rejects.toThrow(
        'Invalid API Key',
      );
      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException with empty API key', async () => {
      await expect(service.generateToken('')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException with null API key', async () => {
      await expect(service.generateToken(null)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('validateUser', () => {
    it('should validate and return user information from JWT payload', async () => {
      const mockPayload = {
        sub: 'api-user',
        role: 'admin',
        iat: Math.floor(Date.now() / 1000),
      };

      const result = await service.validateUser(mockPayload);

      expect(result).toEqual({
        userId: 'api-user',
        role: 'admin',
      });
    });

    it('should handle different user IDs', async () => {
      const mockPayload = {
        sub: 'different-user',
        role: 'user',
      };

      const result = await service.validateUser(mockPayload);

      expect(result.userId).toBe('different-user');
      expect(result.role).toBe('user');
    });
  });
});
