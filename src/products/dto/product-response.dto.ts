import { ApiProperty } from '@nestjs/swagger';
import { Product } from '../schemas/product.schema';

export class ProductResponseDto {
  @ApiProperty({
    description: 'Product ID',
    example: '507f1f77bcf86cd799439011',
  })
  id: string;

  @ApiProperty({
    description: 'Product SKU',
    example: 19996,
  })
  sku: number;

  @ApiProperty({
    description: 'Product name',
    example: 'Nike Performance NLQ3UY',
  })
  name: string;

  @ApiProperty({
    description: 'Product brand',
    example: 'Nike',
  })
  brand: string;

  @ApiProperty({
    description: 'Product model',
    example: 'NLQ3UY',
  })
  model: string;

  @ApiProperty({
    description: 'Product category',
    example: 'Footwear',
  })
  category: string;

  @ApiProperty({
    description: 'Product color',
    example: 'Pink',
  })
  color: string;

  @ApiProperty({
    description: 'Product price',
    example: 52,
  })
  price: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'CAD',
  })
  currency: string;

  @ApiProperty({
    description: 'Available stock',
    example: 490,
  })
  stock: number;

  @ApiProperty({
    description: 'Created at timestamp',
    example: '2025-11-17T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Updated at timestamp',
    example: '2025-11-17T00:00:00.000Z',
  })
  updatedAt: Date;

  static fromEntity(product: Product & { _id: any }): ProductResponseDto {
    const dto = new ProductResponseDto();
    dto.id = product._id.toString();
    dto.sku = product.sku;
    dto.name = product.name;
    dto.brand = product.brand;
    dto.model = product.model;
    dto.category = product.category;
    dto.color = product.color;
    dto.price = product.price;
    dto.currency = product.currency;
    dto.stock = product.stock;
    dto.createdAt = product.createdAt;
    dto.updatedAt = product.updatedAt;
    return dto;
  }
}
