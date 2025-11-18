import {
  Controller,
  Get,
  Delete,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import {
  QueryProductsDto,
  ProductResponseDto,
  PaginatedProductsResponseDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post('sync')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Sync products from Contentful',
    description:
      'Manually trigger synchronization of products from Contentful API. Requires JWT authentication.',
  })
  @ApiResponse({
    status: 200,
    description: 'Products synced successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Products synced successfully' },
        count: { type: 'number', example: 30 },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async syncProducts() {
    const count = await this.productsService.syncProductsFromContentful();
    return {
      message: 'Products synced successfully',
      count,
    };
  }

  @Delete('truncate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Truncate all products',
    description:
      'Delete all products from the collection. WARNING: This operation cannot be undone! Requires JWT authentication.',
  })
  @ApiResponse({
    status: 200,
    description: 'All products deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'All products deleted successfully',
        },
        deletedCount: { type: 'number', example: 100 },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async truncateProducts() {
    const deletedCount = await this.productsService.truncate();
    return {
      message: 'All products deleted successfully',
      deletedCount,
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Get all products',
    description:
      'Retrieve paginated list of products with optional filters. Soft-deleted products are excluded.',
  })
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully',
    type: PaginatedProductsResponseDto,
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'name', required: false, type: String })
  @ApiQuery({ name: 'brand', required: false, type: String })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'color', required: false, type: String })
  @ApiQuery({ name: 'minPrice', required: false, type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  @ApiQuery({ name: 'sku', required: false, type: Number })
  async findAll(
    @Query() queryDto: QueryProductsDto,
  ): Promise<PaginatedProductsResponseDto> {
    return this.productsService.findAll(queryDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get product by ID',
    description:
      'Retrieve a single product by its ID. Requires JWT authentication.',
  })
  @ApiParam({
    name: 'id',
    description: 'Product ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Product found',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async findOne(@Param('id') id: string): Promise<ProductResponseDto> {
    return this.productsService.findOne(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete product',
    description:
      'Soft delete a product. The product will be marked as deleted but not removed from the database.',
  })
  @ApiParam({
    name: 'id',
    description: 'Product ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Product deleted successfully',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found or already deleted',
  })
  async remove(@Param('id') id: string): Promise<ProductResponseDto> {
    return this.productsService.remove(id);
  }
}
