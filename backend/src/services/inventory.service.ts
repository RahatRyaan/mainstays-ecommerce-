import { Product } from '../models/Product';
import { InventoryLog } from '../models/InventoryLog';
import logger from '../common/logger';

export class InventoryService {
  /**
   * Adjusts stock for a specific product and variant.
   * Prevents negative stock.
   * Logs the inventory change.
   */
  static async adjustStock(
    productId: string,
    variantId: string,
    quantity: number,
    reason: string,
    userId: string
  ) {
    if (quantity === 0) {
      throw new Error('Quantity must be non-zero');
    }

    const product = await Product.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    // `variantId` is typed as an objectId string
    const variant = product.variants.find((v: any) => v._id.toString() === variantId.toString());
    if (!variant) {
      throw new Error('Variant not found');
    }

    const newStock = variant.stock + quantity;

    if (newStock < 0) {
      throw new Error('Insufficient stock');
    }

    const type = quantity > 0 ? 'restock' : 'deduction';

    // Update stock
    variant.stock = newStock;
    await product.save();

    // Log the change
    const log = new InventoryLog({
      product: product._id,
      variantId: variant._id,
      type,
      quantity,
      reason,
      performedBy: userId,
    });
    await log.save();

    // Check low stock threshold
    if (newStock <= variant.lowStockThreshold && type === 'deduction') {
      // In a real system, we might emit an event or send an email here.
      logger.warn(`Low stock alert for product ${product.name}, variant ${variant.sku}. Remaining stock: ${newStock}`);
    }

    return { product, log };
  }
}
