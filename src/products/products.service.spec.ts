import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException, Logger } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from './schemas/product.schema';
import { ContentfulService } from '../contentful/contentful.service';

describe('ProductsService', () => {
  let service: ProductsService;
  let mockProductModel: any;
  let mockContentfulService: any;

  const mockProduct = {
    _id: '507f1f77bcf86cd799439011',
    sku: 123456,
    name: 'Test Product',
    brand: 'Test Brand',
    model: 'TM-001',
    category: 'Electronics',
    color: 'Black',
    price: 99.99,
    currency: 'USD',
    stock: 10,
    contentfulId: 'contentful-123',
    isDeleted: false,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockProductModel = {
      find: jest.fn(),
      findOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
      countDocuments: jest.fn(),
      deleteMany: jest.fn(),
      exec: jest.fn(),
    };

    mockContentfulService = {
      fetchProducts: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getModelToken(Product.name),
          useValue: mockProductModel,
        },
        {
          provide: ContentfulService,
          useValue: mockContentfulService,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);

    // Mock logger to suppress console output during tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('syncProductsFromContentful', () => {
    it('should sync products from Contentful', async () => {
      const mockContentfulData = {
        items: [
          {
            sys: { id: 'contentful-1' },
            fields: {
              sku: 123,
              name: 'Product 1',
              brand: 'Brand A',
              model: 'M1',
              category: 'Cat1',
              color: 'Red',
              price: 100,
              currency: 'USD',
              stock: 5,
            },
          },
          {
            sys: { id: 'contentful-2' },
            fields: {
              sku: 456,
              name: 'Product 2',
              brand: 'Brand B',
              model: 'M2',
              category: 'Cat2',
              color: 'Blue',
              price: 200,
              currency: 'USD',
              stock: 10,
            },
          },
        ],
        total: 2,
      };

      mockContentfulService.fetchProducts.mockResolvedValue(mockContentfulData);
      mockProductModel.findOneAndUpdate.mockResolvedValue(mockProduct);

      const result = await service.syncProductsFromContentful();

      expect(result).toBe(2);
      expect(mockContentfulService.fetchProducts).toHaveBeenCalledWith(30, 0);
      expect(mockProductModel.findOneAndUpdate).toHaveBeenCalledTimes(2);
    });

    it('should handle empty response from Contentful', async () => {
      mockContentfulService.fetchProducts.mockResolvedValue({ items: [] });

      const result = await service.syncProductsFromContentful();

      expect(result).toBe(0);
      expect(mockProductModel.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it('should throw error when Contentful fetch fails', async () => {
      mockContentfulService.fetchProducts.mockRejectedValue(
        new Error('Contentful API Error'),
      );

      await expect(service.syncProductsFromContentful()).rejects.toThrow(
        'Contentful API Error',
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      const mockProducts = [mockProduct];

      mockProductModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(mockProducts),
            }),
          }),
        }),
      });

      mockProductModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await service.findAll({ page: 1, limit: 5 });

      expect(result.data).toHaveLength(1);
      expect(result.meta).toEqual({
        currentPage: 1,
        itemsPerPage: 5,
        totalItems: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      });
    });

    it('should apply filters correctly', async () => {
      mockProductModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue([]),
            }),
          }),
        }),
      });

      mockProductModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      });

      await service.findAll({
        page: 1,
        limit: 5,
        name: 'Test',
        brand: 'Brand',
        minPrice: 50,
        maxPrice: 150,
      });

      expect(mockProductModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          isDeleted: false,
          name: { $regex: 'Test', $options: 'i' },
          brand: { $regex: 'Brand', $options: 'i' },
          price: { $gte: 50, $lte: 150 },
        }),
      );
    });

    it('should apply category filter correctly', async () => {
      mockProductModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue([]),
            }),
          }),
        }),
      });

      mockProductModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      });

      await service.findAll({
        page: 1,
        limit: 5,
        category: 'Electronics',
      });

      expect(mockProductModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          isDeleted: false,
          category: { $regex: 'Electronics', $options: 'i' },
        }),
      );
    });

    it('should apply color filter correctly', async () => {
      mockProductModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue([]),
            }),
          }),
        }),
      });

      mockProductModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      });

      await service.findAll({
        page: 1,
        limit: 5,
        color: 'Red',
      });

      expect(mockProductModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          isDeleted: false,
          color: { $regex: 'Red', $options: 'i' },
        }),
      );
    });

    it('should apply sku filter correctly', async () => {
      mockProductModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue([]),
            }),
          }),
        }),
      });

      mockProductModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      });

      await service.findAll({
        page: 1,
        limit: 5,
        sku: 123456,
      });

      expect(mockProductModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          isDeleted: false,
          sku: 123456,
        }),
      );
    });

    it('should apply multiple filters together', async () => {
      mockProductModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue([]),
            }),
          }),
        }),
      });

      mockProductModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      });

      await service.findAll({
        page: 1,
        limit: 5,
        name: 'Product',
        brand: 'Nike',
        category: 'Footwear',
        color: 'Black',
        sku: 789012,
        minPrice: 50,
        maxPrice: 200,
      });

      expect(mockProductModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          isDeleted: false,
          name: { $regex: 'Product', $options: 'i' },
          brand: { $regex: 'Nike', $options: 'i' },
          category: { $regex: 'Footwear', $options: 'i' },
          color: { $regex: 'Black', $options: 'i' },
          sku: 789012,
          price: { $gte: 50, $lte: 200 },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a product by ID', async () => {
      mockProductModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockProduct),
      });

      const result = await service.findOne('507f1f77bcf86cd799439011');

      expect(result).toBeDefined();
      expect(mockProductModel.findOne).toHaveBeenCalledWith({
        _id: '507f1f77bcf86cd799439011',
        isDeleted: false,
      });
    });

    it('should throw NotFoundException when product not found', async () => {
      mockProductModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne('507f1f77bcf86cd799439011')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should soft delete a product', async () => {
      const deletedProduct = { ...mockProduct, isDeleted: true };

      mockProductModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(deletedProduct),
      });

      const result = await service.remove('507f1f77bcf86cd799439011');

      expect(result).toBeDefined();
      expect(mockProductModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: '507f1f77bcf86cd799439011', isDeleted: false },
        expect.objectContaining({
          isDeleted: true,
          deletedAt: expect.any(Date),
        }),
        { new: true },
      );
    });

    it('should throw NotFoundException when product not found', async () => {
      mockProductModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.remove('507f1f77bcf86cd799439011')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('count', () => {
    it('should count non-deleted products', async () => {
      mockProductModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(10),
      });

      const result = await service.count();

      expect(result).toBe(10);
      expect(mockProductModel.countDocuments).toHaveBeenCalledWith({
        isDeleted: false,
      });
    });
  });

  describe('countDeleted', () => {
    it('should count deleted products', async () => {
      mockProductModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(5),
      });

      const result = await service.countDeleted();

      expect(result).toBe(5);
      expect(mockProductModel.countDocuments).toHaveBeenCalledWith({
        isDeleted: true,
      });
    });
  });

  describe('countAll', () => {
    it('should count all products', async () => {
      mockProductModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(15),
      });

      const result = await service.countAll();

      expect(result).toBe(15);
      expect(mockProductModel.countDocuments).toHaveBeenCalledWith();
    });
  });

  describe('truncate', () => {
    it('should delete all products', async () => {
      mockProductModel.deleteMany.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 20 }),
      });

      const result = await service.truncate();

      expect(result).toBe(20);
      expect(mockProductModel.deleteMany).toHaveBeenCalledWith({});
    });
  });
});
