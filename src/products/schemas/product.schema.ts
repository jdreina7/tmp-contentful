import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type ProductDocument = Product & Document;

@Schema({
  timestamps: true,
  collection: 'products',
})
export class Product {
  @ApiProperty({
    description: 'Product SKU (Stock Keeping Unit)',
    example: 19996,
  })
  @Prop({ required: true, unique: true, index: true })
  sku: number;

  @ApiProperty({
    description: 'Product name',
    example: 'Nike Performance NLQ3UY',
  })
  @Prop({ required: true, index: true })
  name: string;

  @ApiProperty({
    description: 'Product brand',
    example: 'Nike',
  })
  @Prop({ required: true, index: true })
  brand: string;

  @ApiProperty({
    description: 'Product model',
    example: 'NLQ3UY',
  })
  @Prop({ required: true })
  model: string;

  @ApiProperty({
    description: 'Product category',
    example: 'Footwear',
  })
  @Prop({ required: true, index: true })
  category: string;

  @ApiProperty({
    description: 'Product color',
    example: 'Pink',
  })
  @Prop({ required: true })
  color: string;

  @ApiProperty({
    description: 'Product price',
    example: 52,
  })
  @Prop({ required: true, index: true })
  price: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'CAD',
  })
  @Prop({ required: true })
  currency: string;

  @ApiProperty({
    description: 'Available stock',
    example: 490,
  })
  @Prop({ required: true, default: 0 })
  stock: number;

  @ApiProperty({
    description: 'Contentful entry ID',
    example: '7k7SKD88tNkxRWD12Ns9Pb',
  })
  @Prop({ required: true, unique: true, index: true })
  contentfulId: string;

  @ApiProperty({
    description: 'Soft delete flag',
    example: false,
  })
  @Prop({ required: true, default: false, index: true })
  isDeleted: boolean;

  @ApiProperty({
    description: 'Date when the product was soft deleted',
    example: '2025-11-17T00:00:00.000Z',
    required: false,
  })
  @Prop({ required: false, default: null })
  deletedAt: Date;

  @ApiProperty({
    description: 'Date when the product was created in our DB',
    example: '2025-11-17T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date when the product was last updated in our DB',
    example: '2025-11-17T00:00:00.000Z',
  })
  updatedAt: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// Additional indexes for better query performance
// Note: Simple indexes for sku, category, brand, price, isDeleted, and contentfulId
// are already defined in @Prop decorators above
ProductSchema.index({ name: 'text' }); // Text index for name search

// Compound indexes for common queries
ProductSchema.index({ isDeleted: 1, category: 1 });
ProductSchema.index({ isDeleted: 1, brand: 1 });
ProductSchema.index({ isDeleted: 1, price: 1 });
