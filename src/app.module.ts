import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { APP_GUARD } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';
import { ProductsModule } from './products/products.module';
import { HealthModule } from './health/health.module';
import { ContentfulModule } from './contentful/contentful.module';
import { AuthModule } from './auth/auth.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    // Configuration Module
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      // Validate required environment variables
      validate: (config) => {
        const requiredVars = [
          'MONGODB_URI',
          'CONTENTFUL_SPACE_ID',
          'CONTENTFUL_ACCESS_TOKEN',
          'CONTENTFUL_ENVIRONMENT',
          'CONTENTFUL_CONTENT_TYPE',
        ];
        const missingVars = requiredVars.filter((key) => !config[key]);
        if (missingVars.length > 0) {
          throw new Error(
            `Missing required environment variables: ${missingVars.join(', ')}`,
          );
        }
        return config;
      },
    }),

    // Structured Logging with Pino
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  singleLine: true,
                  translateTime: 'HH:MM:ss Z',
                  ignore: 'pid,hostname',
                },
              }
            : undefined,
        // Redact sensitive information
        redact: {
          paths: ['req.headers.authorization', 'req.body.apiKey'],
          remove: true,
        },
        // Custom serializers
        serializers: {
          req: (req) => ({
            id: req.id,
            method: req.method,
            url: req.url,
            // Redact query params if needed
            // query: req.query,
            params: req.params,
            // Redact authorization header
            // headers: req.headers,
          }),
          res: (res) => ({
            statusCode: res.statusCode,
          }),
        },
      },
    }),

    // Rate Limiting - Global rate limiter
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 second
        limit: 3, // 3 requests per second
      },
      {
        name: 'medium',
        ttl: 10000, // 10 seconds
        limit: 20, // 20 requests per 10 seconds
      },
      {
        name: 'long',
        ttl: 60000, // 60 seconds
        limit: 100, // 100 requests per minute
      },
    ]),

    // In-Memory Cache Module
    CacheModule.register({
      isGlobal: true,
      ttl: 300000, // 5 minutes default TTL (in milliseconds)
      max: 100, // Maximum number of items in cache
    }),

    // Scheduled Tasks
    ScheduleModule.forRoot(),

    // Database Connection
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('MONGODB_URI'),
      }),
    }),

    // Application Modules
    ContentfulModule,
    AuthModule,
    ProductsModule,
    ReportsModule,
    HealthModule,
  ],
  controllers: [],
  providers: [
    // Apply ThrottlerGuard globally
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
