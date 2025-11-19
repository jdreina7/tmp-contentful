import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { ContentfulService } from '../../contentful/contentful.service';

@Injectable()
export class ContentfulHealthIndicator extends HealthIndicator {
  // Cache para health check - evita llamadas repetidas a Contentful
  private healthCheckCache: {
    isHealthy: boolean;
    timestamp: number;
  } | null = null;

  // TTL del cache: 30 segundos
  private readonly CACHE_TTL = 30000;

  constructor(private readonly contentfulService: ContentfulService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const now = Date.now();

      // Verificar si tenemos un resultado cacheado válido
      if (
        this.healthCheckCache &&
        now - this.healthCheckCache.timestamp < this.CACHE_TTL
      ) {
        const isHealthy = this.healthCheckCache.isHealthy;
        const cacheAge = Math.floor(
          (now - this.healthCheckCache.timestamp) / 1000,
        );

        const result = this.getStatus(key, isHealthy, {
          message: isHealthy
            ? 'Contentful API is reachable (cached)'
            : 'Contentful API is unreachable (cached)',
          cached: true,
          cacheAge: `${cacheAge}s`,
        });

        if (isHealthy) {
          return result;
        }

        throw new HealthCheckError('Contentful check failed', result);
      }

      // No hay cache válido, hacer el health check real
      const isHealthy = await this.contentfulService.checkHealth();

      // Actualizar cache
      this.healthCheckCache = {
        isHealthy,
        timestamp: now,
      };

      const result = this.getStatus(key, isHealthy, {
        message: isHealthy
          ? 'Contentful API is reachable'
          : 'Contentful API is unreachable',
        cached: false,
      });

      if (isHealthy) {
        return result;
      }

      throw new HealthCheckError('Contentful check failed', result);
    } catch (error) {
      const result = this.getStatus(key, false, {
        message: 'Contentful API is unreachable',
        error: error.message,
      });
      throw new HealthCheckError('Contentful check failed', result);
    }
  }
}
