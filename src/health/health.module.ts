import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { ContentfulModule } from '../contentful/contentful.module';
import { ContentfulHealthIndicator } from './indicators/contentful.health';

@Module({
  imports: [TerminusModule, ContentfulModule],
  controllers: [HealthController],
  providers: [ContentfulHealthIndicator],
})
export class HealthModule {}
