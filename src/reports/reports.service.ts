import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { DateRangeQueryDto } from './dto/date-range-query.dto';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  /**
   * Report 1: Percentage of deleted products
   * @returns Percentage and counts
   */
  async getDeletedProductsPercentage() {
    const totalProducts = await this.productModel.countDocuments().exec();
    const deletedProducts = await this.productModel
      .countDocuments({ isDeleted: true })
      .exec();

    const percentage =
      totalProducts > 0 ? (deletedProducts / totalProducts) * 100 : 0;

    this.logger.log(
      `Deleted products report: ${deletedProducts}/${totalProducts} (${percentage.toFixed(2)}%)`,
    );

    return {
      totalProducts,
      deletedProducts,
      activeProducts: totalProducts - deletedProducts,
      deletedPercentage: parseFloat(percentage.toFixed(2)),
    };
  }

  /**
   * Report 2: Percentage of non-deleted products with filters
   * @param filters - Date range and price filters
   * @returns Filtered statistics
   */
  async getNonDeletedProductsStats(filters: DateRangeQueryDto) {
    const query: any = { isDeleted: false };

    // Date range filter
    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        query.createdAt.$gte = filters.startDate;
      }
      if (filters.endDate) {
        query.createdAt.$lte = filters.endDate;
      }
    }

    // Price filter
    if (filters.hasPrice !== undefined) {
      if (filters.hasPrice) {
        query.price = { $exists: true, $ne: null, $gt: 0 };
      } else {
        query.$or = [
          { price: { $exists: false } },
          { price: null },
          { price: 0 },
        ];
      }
    }

    const totalNonDeleted = await this.productModel
      .countDocuments({ isDeleted: false })
      .exec();
    const filteredProducts = await this.productModel
      .countDocuments(query)
      .exec();

    const totalProducts = await this.productModel.countDocuments().exec();

    const percentage =
      totalNonDeleted > 0 ? (filteredProducts / totalProducts) * 100 : 0;

    this.logger.log(
      `Non-deleted products report: ${filteredProducts}/${totalNonDeleted} (${percentage.toFixed(2)}%)`,
    );

    return {
      totalProducts,
      totalNonDeleted,
      filteredProducts,
      percentageOfNonDeleted: parseFloat(percentage.toFixed(2)),
      filters: {
        dateRange:
          filters.startDate || filters.endDate
            ? {
                startDate: filters.startDate,
                endDate: filters.endDate,
              }
            : null,
        hasPrice: filters.hasPrice,
      },
    };
  }

  /**
   * Report 3 (Custom): Products statistics by category
   * @returns Category statistics
   */
  async getProductsByCategory() {
    const categoryStats = await this.productModel
      .aggregate([
        {
          $match: { isDeleted: false },
        },
        {
          $group: {
            _id: '$category',
            totalProducts: { $sum: 1 },
            averagePrice: { $avg: '$price' },
            minPrice: { $min: '$price' },
            maxPrice: { $max: '$price' },
            totalStock: { $sum: '$stock' },
          },
        },
        {
          $sort: { totalProducts: -1 },
        },
      ])
      .exec();

    const totalActiveProducts = await this.productModel
      .countDocuments({ isDeleted: false })
      .exec();

    const categoriesWithPercentage = categoryStats.map((category) => ({
      category: category._id,
      totalProducts: category.totalProducts,
      percentage: parseFloat(
        ((category.totalProducts / totalActiveProducts) * 100).toFixed(2),
      ),
      averagePrice: parseFloat(category.averagePrice.toFixed(2)),
      minPrice: category.minPrice,
      maxPrice: category.maxPrice,
      totalStock: category.totalStock,
    }));

    this.logger.log(
      `Category report generated: ${categoryStats.length} categories`,
    );

    return {
      totalActiveProducts,
      totalCategories: categoryStats.length,
      categories: categoriesWithPercentage,
    };
  }

  /**
   * Additional Report: Price range distribution
   * @returns Price distribution statistics
   */
  async getPriceDistribution() {
    const priceRanges = [
      { range: '0-50', min: 0, max: 50 },
      { range: '51-100', min: 51, max: 100 },
      { range: '101-200', min: 101, max: 200 },
      { range: '201-500', min: 201, max: 500 },
      { range: '500+', min: 501, max: Infinity },
    ];

    const distribution = await Promise.all(
      priceRanges.map(async (range) => {
        const count = await this.productModel
          .countDocuments({
            isDeleted: false,
            price: { $gte: range.min, $lte: range.max },
          })
          .exec();

        return {
          range: range.range,
          count,
        };
      }),
    );

    const totalProducts = await this.productModel
      .countDocuments({ isDeleted: false })
      .exec();

    const distributionWithPercentage = distribution.map((item) => ({
      ...item,
      percentage: parseFloat(((item.count / totalProducts) * 100).toFixed(2)),
    }));

    return {
      totalProducts,
      distribution: distributionWithPercentage,
    };
  }
}
