import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

describe('ProductsController', () => {
  let controller: ProductsController;
  let productsService: ProductsService;

  const mockProductsService = {
    syncProductsFromContentful: jest.fn(),
    truncate: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    productsService = module.get<ProductsService>(ProductsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('syncProducts', () => {
    it('should sync products and return count', async () => {
      mockProductsService.syncProductsFromContentful.mockResolvedValue(30);

      const result = await controller.syncProducts();

      expect(result).toEqual({
        message: 'Products synced successfully',
        count: 30,
      });
      expect(productsService.syncProductsFromContentful).toHaveBeenCalled();
    });

    it('should handle sync failure', async () => {
      mockProductsService.syncProductsFromContentful.mockRejectedValue(
        new Error('Sync failed'),
      );

      await expect(controller.syncProducts()).rejects.toThrow('Sync failed');
    });
  });

  describe('truncateProducts', () => {
    it('should truncate products and return deleted count', async () => {
      mockProductsService.truncate.mockResolvedValue(100);

      const result = await controller.truncateProducts();

      expect(result).toEqual({
        message: 'All products deleted successfully',
        deletedCount: 100,
      });
      expect(productsService.truncate).toHaveBeenCalled();
    });

    it('should return 0 when no products to delete', async () => {
      mockProductsService.truncate.mockResolvedValue(0);

      const result = await controller.truncateProducts();

      expect(result.deletedCount).toBe(0);
    });
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      const mockResponse = {
        data: [],
        meta: {
          currentPage: 1,
          itemsPerPage: 5,
          totalItems: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      mockProductsService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll({ page: 1, limit: 5 });

      expect(result).toEqual(mockResponse);
      expect(productsService.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 5,
      });
    });

    it('should pass filters to service', async () => {
      const queryDto = {
        page: 1,
        limit: 10,
        name: 'Test',
        brand: 'Brand',
        minPrice: 50,
        maxPrice: 150,
      };

      mockProductsService.findAll.mockResolvedValue({
        data: [],
        meta: {} as any,
      });

      await controller.findAll(queryDto);

      expect(productsService.findAll).toHaveBeenCalledWith(queryDto);
    });
  });

  describe('findOne', () => {
    it('should return a product by ID', async () => {
      const mockProduct = {
        id: '507f1f77bcf86cd799439011',
        sku: 123,
        name: 'Test Product',
      };

      mockProductsService.findOne.mockResolvedValue(mockProduct as any);

      const result = await controller.findOne('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockProduct);
      expect(productsService.findOne).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });

    it('should throw error when product not found', async () => {
      mockProductsService.findOne.mockRejectedValue(
        new Error('Product not found'),
      );

      await expect(
        controller.findOne('507f1f77bcf86cd799439011'),
      ).rejects.toThrow('Product not found');
    });
  });

  describe('remove', () => {
    it('should soft delete a product', async () => {
      const mockDeletedProduct = {
        id: '507f1f77bcf86cd799439011',
        sku: 123,
        name: 'Test Product',
        isDeleted: true,
      };

      mockProductsService.remove.mockResolvedValue(mockDeletedProduct as any);

      const result = await controller.remove('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockDeletedProduct);
      expect(productsService.remove).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });

    it('should throw error when product not found', async () => {
      mockProductsService.remove.mockRejectedValue(
        new Error('Product not found or already deleted'),
      );

      await expect(
        controller.remove('507f1f77bcf86cd799439011'),
      ).rejects.toThrow('Product not found or already deleted');
    });
  });
});
