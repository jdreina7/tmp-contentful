import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security headers with Helmet
  app.use(
    helmet({
      contentSecurityPolicy:
        process.env.NODE_ENV === 'production'
          ? undefined
          : {
              directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
                imgSrc: ["'self'", 'data:', 'https:'],
              },
            },
      crossOriginEmbedderPolicy: false, // Disable for Swagger compatibility
    }),
  );

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // API Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Contentful Products Report API')
    .setDescription(
      'API for managing and reporting on products from Contentful CMS. Includes product synchronization, filtering, pagination, and analytics.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Auth', 'Authentication endpoints - Generate JWT tokens')
    .addTag('Health', 'Health check endpoints - API and dependencies status')
    .addTag('Products', 'Product management endpoints - CRUD operations')
    .addTag('Reports', 'Analytics and reporting endpoints - Protected by JWT')
    .addServer(process.env.API_URL || 'http://localhost:3000', 'Local server')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Contentful Products API - Documentation',
    customfavIcon: 'https://nestjs.com/img/logo_text.svg',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`
    ╔═══════════════════════════════════════════════════════════════════╗
    ║                                                                   ║
    ║   🚀 Contentful Products Report API is running!                   ║
    ║                                                                   ║
    ║   📍 Local:            http://localhost:${port}                   ║
    ║   📚 Swagger Docs:     http://localhost:${port}/api/docs          ║
    ║   ❤️  Health Check:     http://localhost:${port}/api/v1/health.   ║
    ║                                                                   ║
    ╚═══════════════════════════════════════════════════════════════════╝
  `);
}

void bootstrap();
