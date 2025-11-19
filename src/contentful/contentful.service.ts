import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  ContentfulResponse,
  ContentfulProductEntry,
} from '../common/interfaces';

@Injectable()
export class ContentfulService {
  private readonly logger = new Logger(ContentfulService.name);
  private readonly apiUrl: string;
  private readonly spaceId: string;
  private readonly accessToken: string;
  private readonly environment: string;
  private readonly contentType: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.spaceId = this.configService.get<string>('CONTENTFUL_SPACE_ID');
    this.accessToken = this.configService.get<string>(
      'CONTENTFUL_ACCESS_TOKEN',
    );
    this.environment =
      this.configService.get<string>('CONTENTFUL_ENVIRONMENT') || 'master';
    this.contentType =
      this.configService.get<string>('CONTENTFUL_CONTENT_TYPE') || 'product';

    // Build API URL
    this.apiUrl = `https://cdn.contentful.com/spaces/${this.spaceId}/environments/${this.environment}/entries`;
  }

  /**
   * Fetch products from Contentful API
   * @param limit - Number of products to fetch (default: 30)
   * @param skip - Number of products to skip for pagination (default: 0)
   * @returns Promise with Contentful response
   */
  async fetchProducts(
    limit = 30,
    skip = 0,
  ): Promise<ContentfulResponse<ContentfulProductEntry>> {
    try {
      this.logger.log(
        `Fetching products from Contentful (limit: ${limit}, skip: ${skip})`,
      );

      const response = await firstValueFrom(
        this.httpService.get<ContentfulResponse<ContentfulProductEntry>>(
          this.apiUrl,
          {
            params: {
              content_type: this.contentType,
              limit,
              skip,
            },
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
            },
          },
        ),
      );

      this.logger.log(
        `Successfully fetched ${response.data.items.length} products from Contentful`,
      );

      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to fetch products from Contentful: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Check if Contentful API is reachable and credentials are valid
   * @returns Promise with boolean indicating health status
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(this.apiUrl, {
          params: {
            content_type: this.contentType,
            limit: 1,
          },
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
          timeout: 10000, // Aumentado a 10 segundos para evitar timeouts bajo carga
        }),
      );

      return response.status === 200;
    } catch (error) {
      this.logger.error(`Contentful health check failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Fetch all products from Contentful (handles pagination automatically)
   * @param maxProducts - Maximum number of products to fetch (default: 1000)
   * @returns Promise with array of all product entries
   */
  async fetchAllProducts(
    maxProducts = 1000,
  ): Promise<ContentfulProductEntry[]> {
    const allProducts: ContentfulProductEntry[] = [];
    let skip = 0;
    const limit = 100; // Contentful max limit per request

    try {
      while (allProducts.length < maxProducts) {
        const response = await this.fetchProducts(limit, skip);

        if (response.items.length === 0) {
          break; // No more products
        }

        allProducts.push(...response.items);

        // Check if we've fetched all available products
        if (allProducts.length >= response.total) {
          break;
        }

        skip += limit;
      }

      this.logger.log(`Fetched total of ${allProducts.length} products`);
      return allProducts.slice(0, maxProducts);
    } catch (error) {
      this.logger.error(
        `Failed to fetch all products: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
