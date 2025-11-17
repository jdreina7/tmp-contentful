import { Test, TestingModule } from '@nestjs/testing';
import { HealthCheckError } from '@nestjs/terminus';
import { ContentfulHealthIndicator } from './contentful.health';
import { ContentfulService } from '../../contentful/contentful.service';

describe('ContentfulHealthIndicator', () => {
  let indicator: ContentfulHealthIndicator;
  let contentfulService: ContentfulService;

  const mockContentfulService = {
    checkHealth: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContentfulHealthIndicator,
        {
          provide: ContentfulService,
          useValue: mockContentfulService,
        },
      ],
    }).compile();

    indicator = module.get<ContentfulHealthIndicator>(
      ContentfulHealthIndicator,
    );
    contentfulService = module.get<ContentfulService>(ContentfulService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(indicator).toBeDefined();
  });

  describe('isHealthy', () => {
    it('should return healthy status when Contentful is reachable', async () => {
      mockContentfulService.checkHealth.mockResolvedValue(true);

      const result = await indicator.isHealthy('contentful');

      expect(result).toHaveProperty('contentful');
      expect(result.contentful).toHaveProperty('status', 'up');
      expect(contentfulService.checkHealth).toHaveBeenCalled();
    });

    it('should throw HealthCheckError when Contentful is unreachable', async () => {
      mockContentfulService.checkHealth.mockResolvedValue(false);

      await expect(indicator.isHealthy('contentful')).rejects.toThrow(
        HealthCheckError,
      );
    });

    it('should throw HealthCheckError when checkHealth throws error', async () => {
      mockContentfulService.checkHealth.mockRejectedValue(
        new Error('Network error'),
      );

      await expect(indicator.isHealthy('contentful')).rejects.toThrow(
        HealthCheckError,
      );
    });

    it('should include error message in result when check fails', async () => {
      mockContentfulService.checkHealth.mockRejectedValue(
        new Error('Connection timeout'),
      );

      try {
        await indicator.isHealthy('contentful');
      } catch (error) {
        expect(error).toBeInstanceOf(HealthCheckError);
        expect(error.message).toBe('Contentful check failed');
      }
    });
  });
});
