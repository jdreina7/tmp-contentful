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

    it('should use cached result when called within cache TTL', async () => {
      mockContentfulService.checkHealth.mockResolvedValue(true);

      // Primera llamada - debe hacer el check real
      const result1 = await indicator.isHealthy('contentful');
      expect(result1.contentful.cached).toBe(false);
      expect(contentfulService.checkHealth).toHaveBeenCalledTimes(1);

      // Segunda llamada - debe usar cache
      const result2 = await indicator.isHealthy('contentful');
      expect(result2.contentful.cached).toBe(true);
      expect(result2.contentful.message).toContain('cached');
      expect(contentfulService.checkHealth).toHaveBeenCalledTimes(1); // No debe llamar de nuevo
    });

    it('should refresh cache after TTL expires', async () => {
      jest.useFakeTimers();
      mockContentfulService.checkHealth.mockResolvedValue(true);

      // Primera llamada
      await indicator.isHealthy('contentful');
      expect(contentfulService.checkHealth).toHaveBeenCalledTimes(1);

      // Avanzar tiempo 31 segundos (más que el TTL de 30 segundos)
      jest.advanceTimersByTime(31000);

      // Segunda llamada - cache expirado, debe hacer check real
      const result = await indicator.isHealthy('contentful');
      expect(result.contentful.cached).toBe(false);
      expect(contentfulService.checkHealth).toHaveBeenCalledTimes(2);

      jest.useRealTimers();
    });

    it('should cache failed health checks', async () => {
      mockContentfulService.checkHealth.mockResolvedValue(false);

      // Primera llamada - debe fallar
      await expect(indicator.isHealthy('contentful')).rejects.toThrow(
        HealthCheckError,
      );
      expect(contentfulService.checkHealth).toHaveBeenCalledTimes(1);

      // Segunda llamada - debe usar cache del fallo
      await expect(indicator.isHealthy('contentful')).rejects.toThrow(
        HealthCheckError,
      );
      expect(contentfulService.checkHealth).toHaveBeenCalledTimes(1); // No debe llamar de nuevo
    });

    it('should include cache age in cached responses', async () => {
      jest.useFakeTimers();
      mockContentfulService.checkHealth.mockResolvedValue(true);

      // Primera llamada
      await indicator.isHealthy('contentful');

      // Avanzar 10 segundos
      jest.advanceTimersByTime(10000);

      // Segunda llamada - debe mostrar edad del cache
      const result = await indicator.isHealthy('contentful');
      expect(result.contentful.cached).toBe(true);
      expect(result.contentful.cacheAge).toBe('10s');

      jest.useRealTimers();
    });
  });
});
