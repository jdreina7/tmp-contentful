import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { ContentfulService } from '../contentful/contentful.service';
import {
  QueryProductsDto,
  ProductResponseDto,
  PaginatedProductsResponseDto,
  PaginationMeta,
} from './dto';
import { ContentfulProductEntry } from '../common/interfaces';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    private readonly contentfulService: ContentfulService,
  ) {}

  /**
   * Sync products from Contentful API to database
   * @returns Number of products synced
   */
  async syncProductsFromContentful(): Promise<number> {
    try {
      this.logger.log('Starting products sync from Contentful...');

      const contentfulData = await this.contentfulService.fetchProducts(30, 0);

      let syncedCount = 0;

      for (const entry of contentfulData.items) {
        await this.upsertProductFromContentful(entry);
        syncedCount++;
      }

      this.logger.log(`Successfully synced ${syncedCount} products`);
      return syncedCount;
    } catch (error) {
      this.logger.error(
        `Failed to sync products from Contentful: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Upsert a product from Contentful entry
   * @param entry - Contentful product entry
   * @returns Created or updated product
   */
  private async upsertProductFromContentful(
    entry: ContentfulProductEntry,
  ): Promise<ProductDocument> {
    const productData = {
      sku: entry.fields.sku,
      name: entry.fields.name,
      brand: entry.fields.brand,
      model: entry.fields.model,
      category: entry.fields.category,
      color: entry.fields.color,
      price: entry.fields.price,
      currency: entry.fields.currency,
      stock: entry.fields.stock,
      contentfulId: entry.sys.id,
    };

    return this.productModel.findOneAndUpdate(
      { contentfulId: entry.sys.id },
      {
        ...productData,
        // Don't override soft delete status on sync
        $setOnInsert: { isDeleted: false, deletedAt: null },
      },
      { upsert: true, new: true },
    );
  }

  /**
   * Find all products with pagination and filters
   * @param queryDto - Query parameters
   * @returns Paginated products
   */
  async findAll(
    queryDto: QueryProductsDto,
  ): Promise<PaginatedProductsResponseDto> {
    const { page = 1, limit = 5, ...filters } = queryDto;

    // Build filter query
    const filterQuery = this.buildFilterQuery(filters);

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [products, totalItems] = await Promise.all([
      this.productModel
        .find(filterQuery)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.productModel.countDocuments(filterQuery).exec(),
    ]);

    // Build pagination metadata
    const totalPages = Math.ceil(totalItems / limit);
    const meta: PaginationMeta = {
      currentPage: page,
      itemsPerPage: limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };

    // Transform to DTOs
    const data = products.map((product) =>
      ProductResponseDto.fromEntity(product),
    );

    return { data, meta };
  }

  /**
   * Build MongoDB filter query from DTO
   * @param filters - Filter parameters
   * @returns MongoDB filter query
   */
  private buildFilterQuery(
    filters: Partial<QueryProductsDto>,
  ): FilterQuery<ProductDocument> {
    const query: FilterQuery<ProductDocument> = {
      isDeleted: false, // Always exclude soft-deleted products
    };

    if (filters.name) {
      query.name = { $regex: filters.name, $options: 'i' };
    }

    if (filters.brand) {
      query.brand = { $regex: filters.brand, $options: 'i' };
    }

    if (filters.category) {
      query.category = { $regex: filters.category, $options: 'i' };
    }

    if (filters.color) {
      query.color = { $regex: filters.color, $options: 'i' };
    }

    if (filters.sku) {
      query.sku = filters.sku;
    }

    // Price range filter
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      query.price = {};
      if (filters.minPrice !== undefined) {
        query.price.$gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        query.price.$lte = filters.maxPrice;
      }
    }

    return query;
  }

  /**
   * Find a product by ID
   * @param id - Product ID
   * @returns Product
   */
  async findOne(id: string): Promise<ProductResponseDto> {
    const product = await this.productModel
      .findOne({ _id: id, isDeleted: false })
      .exec();

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return ProductResponseDto.fromEntity(product);
  }

  /**
   * Soft delete a product
   * @param id - Product ID
   * @returns Deleted product
   */
  async remove(id: string): Promise<ProductResponseDto> {
    const product = await this.productModel
      .findOneAndUpdate(
        { _id: id, isDeleted: false },
        {
          isDeleted: true,
          deletedAt: new Date(),
        },
        { new: true },
      )
      .exec();

    if (!product) {
      throw new NotFoundException(
        `Product with ID ${id} not found or already deleted`,
      );
    }

    this.logger.log(`Product ${id} soft deleted`);
    return ProductResponseDto.fromEntity(product);
  }

  /**
   * Count total products (excluding soft-deleted)
   * @returns Total count
   */
  async count(): Promise<number> {
    return this.productModel.countDocuments({ isDeleted: false }).exec();
  }

  /**
   * Count soft-deleted products
   * @returns Total count of deleted products
   */
  async countDeleted(): Promise<number> {
    return this.productModel.countDocuments({ isDeleted: true }).exec();
  }

  /**
   * Count total products (including soft-deleted)
   * @returns Total count
   */
  async countAll(): Promise<number> {
    return this.productModel.countDocuments().exec();
  }

  /**
   * Truncate (delete all) products from the collection
   * WARNING: This operation cannot be undone
   * @returns Number of deleted products
   */
  async truncate(): Promise<number> {
    this.logger.warn('⚠️  Truncating all products from the collection...');

    const result = await this.productModel.deleteMany({}).exec();

    this.logger.warn(
      `⚠️  Truncated ${result.deletedCount} products from the collection`,
    );

    return result.deletedCount;
  }
}
