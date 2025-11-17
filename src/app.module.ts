import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ProductsModule } from './products/products.module';
import { HealthModule } from './health/health.module';
import { ContentfulModule } from './contentful/contentful.module';
import { AuthModule } from './auth/auth.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
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
    ScheduleModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('MONGODB_URI'),
      }),
    }),
    ContentfulModule,
    AuthModule,
    ProductsModule,
    ReportsModule,
    HealthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
