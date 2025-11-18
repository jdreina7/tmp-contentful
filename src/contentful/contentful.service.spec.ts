import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Logger } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { ContentfulService } from './contentful.service';
import { AxiosResponse } from 'axios';

describe('ContentfulService', () => {
  let service: ContentfulService;
  let httpService: HttpService;
  let _configService: ConfigService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        CONTENTFUL_SPACE_ID: 'test-space-id',
        CONTENTFUL_ACCESS_TOKEN: 'test-access-token',
        CONTENTFUL_ENVIRONMENT: 'master',
        CONTENTFUL_CONTENT_TYPE: 'product',
      };
      return config[key];
    }),
  };

  const mockHttpService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContentfulService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<ContentfulService>(ContentfulService);
    httpService = module.get<HttpService>(HttpService);
    _configService = module.get<ConfigService>(ConfigService);

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

  describe('constructor defaults', () => {
    it('should use default environment value when CONTENTFUL_ENVIRONMENT is not defined', async () => {
      const mockConfigWithoutEnv = {
        get: jest.fn((key: string) => {
          const config = {
            CONTENTFUL_SPACE_ID: 'test-space-id',
            CONTENTFUL_ACCESS_TOKEN: 'test-access-token',
            CONTENTFUL_ENVIRONMENT: undefined,
            CONTENTFUL_CONTENT_TYPE: 'product',
          };
          return config[key];
        }),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          ContentfulService,
          {
            provide: HttpService,
            useValue: mockHttpService,
          },
          {
            provide: ConfigService,
            useValue: mockConfigWithoutEnv,
          },
        ],
      }).compile();

      const serviceWithDefaults =
        module.get<ContentfulService>(ContentfulService);

      // Mock logger
      jest.spyOn(Logger.prototype, 'log').mockImplementation();

      const mockResponse: AxiosResponse = {
        data: {
          items: [],
          total: 0,
          skip: 0,
          limit: 30,
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      mockHttpService.get.mockReturnValue(of(mockResponse));

      await serviceWithDefaults.fetchProducts();

      // Verify that the URL contains 'master' as the default environment
      expect(mockHttpService.get).toHaveBeenCalledWith(
        expect.stringContaining('/environments/master/'),
        expect.any(Object),
      );
    });

    it('should use default content type value when CONTENTFUL_CONTENT_TYPE is not defined', async () => {
      const mockConfigWithoutType = {
        get: jest.fn((key: string) => {
          const config = {
            CONTENTFUL_SPACE_ID: 'test-space-id',
            CONTENTFUL_ACCESS_TOKEN: 'test-access-token',
            CONTENTFUL_ENVIRONMENT: 'master',
            CONTENTFUL_CONTENT_TYPE: undefined,
          };
          return config[key];
        }),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          ContentfulService,
          {
            provide: HttpService,
            useValue: mockHttpService,
          },
          {
            provide: ConfigService,
            useValue: mockConfigWithoutType,
          },
        ],
      }).compile();

      const serviceWithDefaults =
        module.get<ContentfulService>(ContentfulService);

      // Mock logger
      jest.spyOn(Logger.prototype, 'log').mockImplementation();

      const mockResponse: AxiosResponse = {
        data: {
          items: [],
          total: 0,
          skip: 0,
          limit: 30,
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      mockHttpService.get.mockReturnValue(of(mockResponse));

      await serviceWithDefaults.fetchProducts();

      // Verify that the params contain 'product' as the default content type
      expect(mockHttpService.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: expect.objectContaining({
            content_type: 'product',
          }),
        }),
      );
    });

    it('should use both default values when both environment variables are not defined', async () => {
      const mockConfigWithoutBoth = {
        get: jest.fn((key: string) => {
          const config = {
            CONTENTFUL_SPACE_ID: 'test-space-id',
            CONTENTFUL_ACCESS_TOKEN: 'test-access-token',
            CONTENTFUL_ENVIRONMENT: undefined,
            CONTENTFUL_CONTENT_TYPE: undefined,
          };
          return config[key];
        }),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          ContentfulService,
          {
            provide: HttpService,
            useValue: mockHttpService,
          },
          {
            provide: ConfigService,
            useValue: mockConfigWithoutBoth,
          },
        ],
      }).compile();

      const serviceWithDefaults =
        module.get<ContentfulService>(ContentfulService);

      // Mock logger
      jest.spyOn(Logger.prototype, 'log').mockImplementation();

      const mockResponse: AxiosResponse = {
        data: {
          items: [],
          total: 0,
          skip: 0,
          limit: 30,
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      mockHttpService.get.mockReturnValue(of(mockResponse));

      await serviceWithDefaults.fetchProducts();

      // Verify URL contains 'master' and params contain 'product'
      expect(mockHttpService.get).toHaveBeenCalledWith(
        expect.stringContaining('/environments/master/'),
        expect.objectContaining({
          params: expect.objectContaining({
            content_type: 'product',
          }),
        }),
      );
    });
  });

  describe('fetchProducts', () => {
    it('should fetch products successfully', async () => {
      const mockResponse: AxiosResponse = {
        data: {
          items: [
            {
              sys: { id: 'entry1' },
              fields: { sku: 123, name: 'Product 1' },
            },
            {
              sys: { id: 'entry2' },
              fields: { sku: 456, name: 'Product 2' },
            },
          ],
          total: 2,
          skip: 0,
          limit: 30,
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.fetchProducts(30, 0);

      expect(result).toEqual(mockResponse.data);
      expect(result.items).toHaveLength(2);
      expect(httpService.get).toHaveBeenCalledWith(
        expect.stringContaining('cdn.contentful.com'),
        expect.objectContaining({
          params: {
            content_type: 'product',
            limit: 30,
            skip: 0,
          },
          headers: {
            Authorization: 'Bearer test-access-token',
          },
        }),
      );
    });

    it('should fetch products with custom pagination', async () => {
      const mockResponse: AxiosResponse = {
        data: {
          items: [],
          total: 100,
          skip: 50,
          limit: 10,
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      mockHttpService.get.mockReturnValue(of(mockResponse));

      await service.fetchProducts(10, 50);

      expect(httpService.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: {
            content_type: 'product',
            limit: 10,
            skip: 50,
          },
        }),
      );
    });

    it('should throw error when fetch fails', async () => {
      const mockError = new Error('Network error');
      mockHttpService.get.mockReturnValue(throwError(() => mockError));

      await expect(service.fetchProducts()).rejects.toThrow('Network error');
    });
  });

  describe('checkHealth', () => {
    it('should return true when API is healthy', async () => {
      const mockResponse: AxiosResponse = {
        data: { items: [] },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.checkHealth();

      expect(result).toBe(true);
      expect(httpService.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: {
            content_type: 'product',
            limit: 1,
          },
          timeout: 10000,
        }),
      );
    });

    it('should return false when API is down', async () => {
      mockHttpService.get.mockReturnValue(
        throwError(() => new Error('Connection failed')),
      );

      const result = await service.checkHealth();

      expect(result).toBe(false);
    });

    it('should return false when API returns non-200 status', async () => {
      const mockResponse: AxiosResponse = {
        data: {},
        status: 500,
        statusText: 'Internal Server Error',
        headers: {},
        config: {} as any,
      };

      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.checkHealth();

      expect(result).toBe(false);
    });
  });

  describe('fetchAllProducts', () => {
    it('should fetch all products with pagination', async () => {
      const mockResponse1: AxiosResponse = {
        data: {
          items: new Array(100).fill(null).map((_, i) => ({
            sys: { id: `entry${i}` },
            fields: { sku: i, name: `Product ${i}` },
          })),
          total: 150,
          skip: 0,
          limit: 100,
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      const mockResponse2: AxiosResponse = {
        data: {
          items: new Array(50).fill(null).map((_, i) => ({
            sys: { id: `entry${i + 100}` },
            fields: { sku: i + 100, name: `Product ${i + 100}` },
          })),
          total: 150,
          skip: 100,
          limit: 100,
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      mockHttpService.get
        .mockReturnValueOnce(of(mockResponse1))
        .mockReturnValueOnce(of(mockResponse2));

      const result = await service.fetchAllProducts();

      expect(result).toHaveLength(150);
      expect(httpService.get).toHaveBeenCalledTimes(2);
    });

    it('should respect maxProducts limit', async () => {
      const mockResponse: AxiosResponse = {
        data: {
          items: new Array(100).fill(null).map((_, i) => ({
            sys: { id: `entry${i}` },
            fields: { sku: i, name: `Product ${i}` },
          })),
          total: 500,
          skip: 0,
          limit: 100,
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.fetchAllProducts(50);

      expect(result).toHaveLength(50);
    });

    it('should stop fetching when no more items', async () => {
      const mockResponse: AxiosResponse = {
        data: {
          items: [],
          total: 0,
          skip: 0,
          limit: 100,
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.fetchAllProducts();

      expect(result).toHaveLength(0);
      expect(httpService.get).toHaveBeenCalledTimes(1);
    });

    it('should throw error when fetch fails', async () => {
      mockHttpService.get.mockReturnValue(
        throwError(() => new Error('API Error')),
      );

      await expect(service.fetchAllProducts()).rejects.toThrow('API Error');
    });
  });
});
