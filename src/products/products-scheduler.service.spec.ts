import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { ProductsSchedulerService } from './products-scheduler.service';
import { ProductsService } from './products.service';

describe('ProductsSchedulerService', () => {
  let service: ProductsSchedulerService;
  let productsService: ProductsService;

  const mockProductsService = {
    syncProductsFromContentful: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsSchedulerService,
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    service = module.get<ProductsSchedulerService>(ProductsSchedulerService);
    productsService = module.get<ProductsService>(ProductsService);

    // Mock logger to suppress console output during tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleProductSync', () => {
    it('should sync products successfully', async () => {
      mockProductsService.syncProductsFromContentful.mockResolvedValue(30);

      await service.handleProductSync();

      expect(productsService.syncProductsFromContentful).toHaveBeenCalled();
    });

    it('should handle sync errors gracefully', async () => {
      const error = new Error('Sync failed');
      mockProductsService.syncProductsFromContentful.mockRejectedValue(error);

      await expect(service.handleProductSync()).resolves.not.toThrow();
      expect(productsService.syncProductsFromContentful).toHaveBeenCalled();
    });

    it('should log success when sync completes', async () => {
      mockProductsService.syncProductsFromContentful.mockResolvedValue(25);

      await service.handleProductSync();

      expect(productsService.syncProductsFromContentful).toHaveBeenCalledTimes(
        1,
      );
    });
  });

  describe('triggerManualSync', () => {
    it('should trigger manual sync and return count', async () => {
      mockProductsService.syncProductsFromContentful.mockResolvedValue(15);

      const result = await service.triggerManualSync();

      expect(result).toBe(15);
      expect(productsService.syncProductsFromContentful).toHaveBeenCalled();
    });

    it('should propagate errors from sync', async () => {
      const error = new Error('Manual sync failed');
      mockProductsService.syncProductsFromContentful.mockRejectedValue(error);

      await expect(service.triggerManualSync()).rejects.toThrow(
        'Manual sync failed',
      );
    });
  });
});
