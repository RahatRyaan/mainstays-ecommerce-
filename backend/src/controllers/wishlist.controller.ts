import { Request, Response } from 'express';
import { Wishlist } from '../models/Wishlist';
import { Product } from '../models/Product';
import logger from '../common/logger';

export class WishlistController {
  /**
   * Get current user's wishlist
   */
  static async getWishlist(req: any, res: Response): Promise<void> {
    try {
      const userId = req.user._id;
      let wishlist = await Wishlist.findOne({ user: userId }).populate({
        path: 'products',
        match: { isDeleted: { $ne: true } },
      });

      if (!wishlist) {
        wishlist = await Wishlist.create({ user: userId, products: [] });
      }

      res.status(200).json({
        success: true,
        data: wishlist.products || [],
      });
    } catch (error: any) {
      logger.error('Error fetching wishlist:', error);
      res.status(500).json({ success: false, message: 'Failed to retrieve wishlist' });
    }
  }

  /**
   * Toggle product in wishlist (Add if not present, Remove if present)
   */
  static async toggleWishlist(req: any, res: Response): Promise<void> {
    try {
      const userId = req.user._id;
      const { productId } = req.body;

      if (!productId) {
        res.status(400).json({ success: false, message: 'Product ID is required' });
        return;
      }

      // Verify product exists
      const product = await Product.findById(productId);
      if (!product) {
        res.status(404).json({ success: false, message: 'Product not found' });
        return;
      }

      let wishlist = await Wishlist.findOne({ user: userId });
      if (!wishlist) {
        wishlist = await Wishlist.create({ user: userId, products: [productId] });
        res.status(200).json({
          success: true,
          action: 'added',
          message: 'Added to wishlist',
          data: [product],
        });
        return;
      }

      const productIndex = wishlist.products.findIndex(
        (id: any) => id.toString() === productId
      );

      let action = 'added';
      if (productIndex > -1) {
        wishlist.products.splice(productIndex, 1);
        action = 'removed';
      } else {
        wishlist.products.push(productId);
        action = 'added';
      }

      await wishlist.save();
      const updatedWishlist = await Wishlist.findOne({ user: userId }).populate('products');

      res.status(200).json({
        success: true,
        action,
        message: action === 'added' ? 'Added to wishlist' : 'Removed from wishlist',
        data: updatedWishlist?.products || [],
      });
    } catch (error: any) {
      logger.error('Error toggling wishlist item:', error);
      res.status(500).json({ success: false, message: 'Failed to update wishlist' });
    }
  }

  /**
   * Clear all items from wishlist
   */
  static async clearWishlist(req: any, res: Response): Promise<void> {
    try {
      const userId = req.user._id;
      await Wishlist.findOneAndUpdate(
        { user: userId },
        { $set: { products: [] } },
        { upsert: true }
      );

      res.status(200).json({
        success: true,
        message: 'Wishlist cleared',
        data: [],
      });
    } catch (error: any) {
      logger.error('Error clearing wishlist:', error);
      res.status(500).json({ success: false, message: 'Failed to clear wishlist' });
    }
  }
}
