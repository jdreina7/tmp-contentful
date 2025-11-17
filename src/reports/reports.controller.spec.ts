import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

describe('ReportsController', () => {
  let controller: ReportsController;
  let reportsService: ReportsService;

  const mockReportsService = {
    getDeletedProductsPercentage: jest.fn(),
    getNonDeletedProductsStats: jest.fn(),
    getProductsByCategory: jest.fn(),
    getPriceDistribution: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        {
          provide: ReportsService,
          useValue: mockReportsService,
        },
      ],
    }).compile();

    controller = module.get<ReportsController>(ReportsController);
    reportsService = module.get<ReportsService>(ReportsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getDeletedPercentage', () => {
    it('should return deleted products percentage', async () => {
      const mockResult = {
        totalProducts: 100,
        deletedProducts: 25,
        activeProducts: 75,
        deletedPercentage: 25.0,
      };

      mockReportsService.getDeletedProductsPercentage.mockResolvedValue(
        mockResult,
      );

      const result = await controller.getDeletedPercentage();

      expect(result).toEqual(mockResult);
      expect(reportsService.getDeletedProductsPercentage).toHaveBeenCalled();
    });
  });

  describe('getNonDeletedStats', () => {
    it('should return non-deleted stats without filters', async () => {
      const mockResult = {
        totalProducts: 100,
        totalNonDeleted: 75,
        filteredProducts: 75,
        percentageOfNonDeleted: 100,
        filters: {
          dateRange: null,
          hasPrice: undefined,
        },
      };

      mockReportsService.getNonDeletedProductsStats.mockResolvedValue(
        mockResult,
      );

      const result = await controller.getNonDeletedStats({});

      expect(result).toEqual(mockResult);
      expect(reportsService.getNonDeletedProductsStats).toHaveBeenCalledWith(
        {},
      );
    });

    it('should return non-deleted stats with date range filter', async () => {
      const filters = {
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
      };

      const mockResult = {
        totalProducts: 100,
        totalNonDeleted: 75,
        filteredProducts: 60,
        percentageOfNonDeleted: 80,
        filters: {
          dateRange: filters,
          hasPrice: undefined,
        },
      };

      mockReportsService.getNonDeletedProductsStats.mockResolvedValue(
        mockResult,
      );

      const result = await controller.getNonDeletedStats(filters);

      expect(result).toEqual(mockResult);
      expect(reportsService.getNonDeletedProductsStats).toHaveBeenCalledWith(
        filters,
      );
    });

    it('should return non-deleted stats with hasPrice filter', async () => {
      const filters = { hasPrice: true };

      const mockResult = {
        totalProducts: 100,
        totalNonDeleted: 75,
        filteredProducts: 70,
        percentageOfNonDeleted: 93.33,
        filters: {
          dateRange: null,
          hasPrice: true,
        },
      };

      mockReportsService.getNonDeletedProductsStats.mockResolvedValue(
        mockResult,
      );

      const result = await controller.getNonDeletedStats(filters);

      expect(result).toEqual(mockResult);
      expect(reportsService.getNonDeletedProductsStats).toHaveBeenCalledWith(
        filters,
      );
    });
  });

  describe('getByCategory', () => {
    it('should return products by category report', async () => {
      const mockResult = {
        totalActiveProducts: 75,
        totalCategories: 3,
        categories: [
          {
            category: 'Electronics',
            totalProducts: 40,
            percentage: 53.33,
            averagePrice: 150.5,
            minPrice: 50,
            maxPrice: 300,
            totalStock: 500,
          },
          {
            category: 'Footwear',
            totalProducts: 20,
            percentage: 26.67,
            averagePrice: 85.75,
            minPrice: 40,
            maxPrice: 150,
            totalStock: 200,
          },
        ],
      };

      mockReportsService.getProductsByCategory.mockResolvedValue(mockResult);

      const result = await controller.getByCategory();

      expect(result).toEqual(mockResult);
      expect(reportsService.getProductsByCategory).toHaveBeenCalled();
    });

    it('should handle empty categories', async () => {
      const mockResult = {
        totalActiveProducts: 0,
        totalCategories: 0,
        categories: [],
      };

      mockReportsService.getProductsByCategory.mockResolvedValue(mockResult);

      const result = await controller.getByCategory();

      expect(result.totalCategories).toBe(0);
      expect(result.categories).toHaveLength(0);
    });
  });

  describe('getPriceDistribution', () => {
    it('should return price distribution report', async () => {
      const mockResult = {
        totalProducts: 75,
        distribution: [
          { range: '0-50', count: 15, percentage: 20 },
          { range: '51-100', count: 30, percentage: 40 },
          { range: '101-200', count: 20, percentage: 26.67 },
          { range: '201-500', count: 8, percentage: 10.67 },
          { range: '500+', count: 2, percentage: 2.67 },
        ],
      };

      mockReportsService.getPriceDistribution.mockResolvedValue(mockResult);

      const result = await controller.getPriceDistribution();

      expect(result).toEqual(mockResult);
      expect(result.distribution).toHaveLength(5);
      expect(reportsService.getPriceDistribution).toHaveBeenCalled();
    });
  });
});
