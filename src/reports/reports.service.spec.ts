import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Logger } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { Product } from '../products/schemas/product.schema';

describe('ReportsService', () => {
  let service: ReportsService;
  let mockProductModel: any;

  beforeEach(async () => {
    mockProductModel = {
      countDocuments: jest.fn(),
      aggregate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: getModelToken(Product.name),
          useValue: mockProductModel,
        },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);

    // Mock logger to suppress console output during tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation();

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDeletedProductsPercentage', () => {
    it('should calculate percentage correctly', async () => {
      mockProductModel.countDocuments
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(100) }) // total
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(25) }); // deleted

      const result = await service.getDeletedProductsPercentage();

      expect(result).toEqual({
        totalProducts: 100,
        deletedProducts: 25,
        activeProducts: 75,
        deletedPercentage: 25,
      });
    });

    it('should handle zero products', async () => {
      mockProductModel.countDocuments
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(0) })
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(0) });

      const result = await service.getDeletedProductsPercentage();

      expect(result.deletedPercentage).toBe(0);
    });

    it('should handle all deleted products', async () => {
      mockProductModel.countDocuments
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(50) })
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(50) });

      const result = await service.getDeletedProductsPercentage();

      expect(result.deletedPercentage).toBe(100);
      expect(result.activeProducts).toBe(0);
    });
  });

  describe('getNonDeletedProductsStats', () => {
    it('should return stats without filters', async () => {
      mockProductModel.countDocuments
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(100) }) // totalNonDeleted
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(100) }) // filteredProducts
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(120) }); // totalProducts

      const result = await service.getNonDeletedProductsStats({});

      expect(result).toEqual({
        totalProducts: 120,
        totalNonDeleted: 100,
        filteredProducts: 100,
        percentageOfNonDeleted: 83.33,
        filters: {
          dateRange: null,
          hasPrice: undefined,
        },
      });
    });

    it('should apply date range filter', async () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-12-31');

      mockProductModel.countDocuments
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(100) })
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(80) })
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(120) });

      const result = await service.getNonDeletedProductsStats({
        startDate,
        endDate,
      });

      expect(result.filters.dateRange).toEqual({ startDate, endDate });
    });

    it('should apply hasPrice filter for products with price', async () => {
      mockProductModel.countDocuments
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(100) })
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(90) })
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(120) });

      const result = await service.getNonDeletedProductsStats({
        hasPrice: true,
      });

      expect(result.filters.hasPrice).toBe(true);
    });

    it('should apply hasPrice filter for products without price', async () => {
      mockProductModel.countDocuments
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(100) })
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(10) })
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(120) });

      const result = await service.getNonDeletedProductsStats({
        hasPrice: false,
      });

      expect(result.filters.hasPrice).toBe(false);
    });
  });

  describe('getProductsByCategory', () => {
    it('should return category statistics', async () => {
      const mockAggregateResult = [
        {
          _id: 'Electronics',
          totalProducts: 30,
          averagePrice: 150.5,
          minPrice: 50,
          maxPrice: 300,
          totalStock: 500,
        },
        {
          _id: 'Footwear',
          totalProducts: 20,
          averagePrice: 85.75,
          minPrice: 40,
          maxPrice: 150,
          totalStock: 200,
        },
      ];

      mockProductModel.aggregate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAggregateResult),
      });

      mockProductModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(50),
      });

      const result = await service.getProductsByCategory();

      expect(result.totalActiveProducts).toBe(50);
      expect(result.totalCategories).toBe(2);
      expect(result.categories).toHaveLength(2);
      expect(result.categories[0]).toMatchObject({
        category: 'Electronics',
        totalProducts: 30,
        percentage: 60,
        averagePrice: 150.5,
      });
    });

    it('should handle no products', async () => {
      mockProductModel.aggregate.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      mockProductModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      });

      const result = await service.getProductsByCategory();

      expect(result.totalActiveProducts).toBe(0);
      expect(result.totalCategories).toBe(0);
      expect(result.categories).toHaveLength(0);
    });
  });

  describe('getPriceDistribution', () => {
    it('should return price distribution', async () => {
      mockProductModel.countDocuments
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(10) }) // 0-50
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(15) }) // 51-100
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(20) }) // 101-200
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(5) }) // 201-500
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(0) }) // 500+
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(50) }); // total

      const result = await service.getPriceDistribution();

      expect(result.totalProducts).toBe(50);
      expect(result.distribution).toHaveLength(5);
      expect(result.distribution[0]).toEqual({
        range: '0-50',
        count: 10,
        percentage: 20,
      });
      expect(result.distribution[1]).toEqual({
        range: '51-100',
        count: 15,
        percentage: 30,
      });
    });

    it('should handle zero products', async () => {
      mockProductModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      });

      const result = await service.getPriceDistribution();

      expect(result.totalProducts).toBe(0);
      expect(result.distribution).toHaveLength(5);
      result.distribution.forEach((item) => {
        expect(item.count).toBe(0);
        expect(isNaN(item.percentage)).toBe(true);
      });
    });
  });
});
