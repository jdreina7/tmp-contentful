import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    generateToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('generateToken', () => {
    it('should generate token with valid API key', async () => {
      const generateTokenDto = { apiKey: 'valid-api-key' };
      const expectedResult = {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      };

      mockAuthService.generateToken.mockResolvedValue(expectedResult);

      const result = await controller.generateToken(generateTokenDto);

      expect(result).toEqual(expectedResult);
      expect(authService.generateToken).toHaveBeenCalledWith('valid-api-key');
      expect(authService.generateToken).toHaveBeenCalledTimes(1);
    });

    it('should throw UnauthorizedException with invalid API key', async () => {
      const generateTokenDto = { apiKey: 'invalid-api-key' };

      mockAuthService.generateToken.mockRejectedValue(
        new UnauthorizedException('Invalid API Key'),
      );

      await expect(controller.generateToken(generateTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authService.generateToken).toHaveBeenCalledWith('invalid-api-key');
    });

    it('should call authService.generateToken with the correct parameter', async () => {
      const generateTokenDto = { apiKey: 'test-key-123' };
      mockAuthService.generateToken.mockResolvedValue({
        access_token: 'token',
      });

      await controller.generateToken(generateTokenDto);

      expect(authService.generateToken).toHaveBeenCalledWith('test-key-123');
    });
  });
});
