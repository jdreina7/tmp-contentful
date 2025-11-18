import { Test, TestingModule } from '@nestjs/testing';
import { HealthCheckService, MongooseHealthIndicator } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { ContentfulHealthIndicator } from './indicators/contentful.health';

describe('HealthController', () => {
  let controller: HealthController;
  let healthCheckService: HealthCheckService;
  let _mongooseHealth: MongooseHealthIndicator;
  let _contentfulHealth: ContentfulHealthIndicator;

  const mockHealthCheckService = {
    check: jest.fn(),
  };

  const mockMongooseHealth = {
    pingCheck: jest.fn(),
  };

  const mockContentfulHealth = {
    isHealthy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: mockHealthCheckService,
        },
        {
          provide: MongooseHealthIndicator,
          useValue: mockMongooseHealth,
        },
        {
          provide: ContentfulHealthIndicator,
          useValue: mockContentfulHealth,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    healthCheckService = module.get<HealthCheckService>(HealthCheckService);
    _mongooseHealth = module.get<MongooseHealthIndicator>(
      MongooseHealthIndicator,
    );
    _contentfulHealth = module.get<ContentfulHealthIndicator>(
      ContentfulHealthIndicator,
    );

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('check', () => {
    it('should return healthy status when all checks pass', async () => {
      const mockHealthResult = {
        status: 'ok',
        info: {
          database: { status: 'up' },
          contentful: { status: 'up' },
        },
        error: {},
        details: {
          database: { status: 'up' },
          contentful: { status: 'up' },
        },
      };

      mockMongooseHealth.pingCheck.mockResolvedValue({
        database: { status: 'up' },
      });

      mockContentfulHealth.isHealthy.mockResolvedValue({
        contentful: { status: 'up' },
      });

      mockHealthCheckService.check.mockResolvedValue(mockHealthResult);

      const result = await controller.check();

      expect(result).toEqual(mockHealthResult);
      expect(healthCheckService.check).toHaveBeenCalled();
    });

    it('should call health indicators correctly', async () => {
      mockHealthCheckService.check.mockImplementation(async (checks) => {
        await Promise.all(checks.map((check) => check()));
        return {
          status: 'ok',
          info: {},
          error: {},
          details: {},
        };
      });

      mockMongooseHealth.pingCheck.mockResolvedValue({
        database: { status: 'up' },
      });

      mockContentfulHealth.isHealthy.mockResolvedValue({
        contentful: { status: 'up' },
      });

      await controller.check();

      expect(mockMongooseHealth.pingCheck).toHaveBeenCalledWith('database');
      expect(mockContentfulHealth.isHealthy).toHaveBeenCalledWith('contentful');
    });
  });
});
