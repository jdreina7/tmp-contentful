import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { ContentfulService } from '../../contentful/contentful.service';

@Injectable()
export class ContentfulHealthIndicator extends HealthIndicator {
  constructor(private readonly contentfulService: ContentfulService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const isHealthy = await this.contentfulService.checkHealth();

      const result = this.getStatus(key, isHealthy, {
        message: isHealthy
          ? 'Contentful API is reachable'
          : 'Contentful API is unreachable',
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
