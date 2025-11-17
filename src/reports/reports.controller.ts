import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DateRangeQueryDto } from './dto/date-range-query.dto';

@ApiTags('Reports')
@Controller('reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('deleted-percentage')
  @ApiOperation({
    summary: 'Report: Percentage of deleted products',
    description:
      'Get statistics about deleted vs active products. Requires JWT authentication.',
  })
  @ApiResponse({
    status: 200,
    description: 'Report generated successfully',
    schema: {
      type: 'object',
      properties: {
        totalProducts: { type: 'number', example: 100 },
        deletedProducts: { type: 'number', example: 25 },
        activeProducts: { type: 'number', example: 75 },
        deletedPercentage: { type: 'number', example: 25.0 },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getDeletedPercentage() {
    return this.reportsService.getDeletedProductsPercentage();
  }

  @Get('non-deleted-stats')
  @ApiOperation({
    summary: 'Report: Non-deleted products statistics',
    description:
      'Get statistics of non-deleted products filtered by price availability and date range. Requires JWT authentication.',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    example: '2025-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    example: '2025-12-31',
  })
  @ApiQuery({
    name: 'hasPrice',
    required: false,
    type: Boolean,
    example: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Report generated successfully',
    schema: {
      type: 'object',
      properties: {
        totalProducts: { type: 'number', example: 100 },
        totalNonDeleted: { type: 'number', example: 75 },
        filteredProducts: { type: 'number', example: 60 },
        percentageOfNonDeleted: { type: 'number', example: 80.0 },
        filters: {
          type: 'object',
          properties: {
            dateRange: {
              type: 'object',
              nullable: true,
            },
            hasPrice: { type: 'boolean', nullable: true },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getNonDeletedStats(@Query() filters: DateRangeQueryDto) {
    return this.reportsService.getNonDeletedProductsStats(filters);
  }

  @Get('by-category')
  @ApiOperation({
    summary: 'Report: Products by category',
    description:
      'Get product distribution and statistics by category. Requires JWT authentication.',
  })
  @ApiResponse({
    status: 200,
    description: 'Report generated successfully',
    schema: {
      type: 'object',
      properties: {
        totalActiveProducts: { type: 'number', example: 75 },
        totalCategories: { type: 'number', example: 5 },
        categories: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              category: { type: 'string', example: 'Footwear' },
              totalProducts: { type: 'number', example: 30 },
              percentage: { type: 'number', example: 40.0 },
              averagePrice: { type: 'number', example: 85.5 },
              minPrice: { type: 'number', example: 45 },
              maxPrice: { type: 'number', example: 150 },
              totalStock: { type: 'number', example: 500 },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getByCategory() {
    return this.reportsService.getProductsByCategory();
  }

  @Get('price-distribution')
  @ApiOperation({
    summary: 'Report: Price distribution',
    description:
      'Get product distribution across different price ranges. Requires JWT authentication.',
  })
  @ApiResponse({
    status: 200,
    description: 'Report generated successfully',
    schema: {
      type: 'object',
      properties: {
        totalProducts: { type: 'number', example: 75 },
        distribution: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              range: { type: 'string', example: '0-50' },
              count: { type: 'number', example: 20 },
              percentage: { type: 'number', example: 26.67 },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getPriceDistribution() {
    return this.reportsService.getPriceDistribution();
  }
}
