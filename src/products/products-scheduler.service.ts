import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ProductsService } from './products.service';

@Injectable()
export class ProductsSchedulerService {
  private readonly logger = new Logger(ProductsSchedulerService.name);

  constructor(private readonly productsService: ProductsService) {}

  /**
   * Scheduled task to sync products from Contentful every hour
   * Cron expression: every hour at minute 0
   */
  @Cron('0 * * * *', {
    name: 'sync-products-from-contentful',
    timeZone: 'UTC',
  })
  async handleProductSync() {
    this.logger.log('🔄 Starting scheduled product sync from Contentful...');

    try {
      const syncedCount =
        await this.productsService.syncProductsFromContentful();

      this.logger.log(
        `✅ Scheduled sync completed successfully. Synced ${syncedCount} products`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Scheduled sync failed: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Manual trigger for testing purposes
   * This method can be called directly to test the sync process
   */
  async triggerManualSync(): Promise<number> {
    this.logger.log('🔄 Manual sync triggered...');
    return await this.productsService.syncProductsFromContentful();
  }
}
