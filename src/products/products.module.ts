import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ProductsSchedulerService } from './products-scheduler.service';
import { Product, ProductSchema } from './schemas/product.schema';
import { ContentfulModule } from '../contentful/contentful.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    ContentfulModule,
    AuthModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService, ProductsSchedulerService],
  exports: [ProductsService],
})
export class ProductsModule {}
