import { Types } from 'mongoose';
import { Review } from '../models/Review';
import { Product } from '../models/Product';
import { SubOrder } from '../models/SubOrder';

export class ReviewService {
  /**
   * Verified Purchase Check: User must have a delivered sub-order 
   * containing the given productId.
   */
  static async checkVerifiedPurchase(userId: string, productId: string) {
    const subOrders = await SubOrder.find({
      'items.product': new Types.ObjectId(productId),
      status: 'delivered',
    }).populate('parentOrder');

    for (const sub of subOrders) {
      const parent = sub.parentOrder as any;
      if (parent.user.toString() === userId) {
        return true;
      }
    }
    return false;
  }

  static async addReview(userId: string, productId: string, rating: number, comment: string) {
    const isVerified = await this.checkVerifiedPurchase(userId, productId);
    if (!isVerified) {
      throw new Error('You must have a delivered order for this product to leave a review.');
    }

    const review = await Review.create({
      product: new Types.ObjectId(productId),
      user: new Types.ObjectId(userId),
      rating,
      comment,
    });

    await this.updateProductRating(productId);

    return review;
  }

  static async getProductReviews(productId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const reviews = await Review.find({ product: productId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name'); // only fetch reviewer's name
    
    const total = await Review.countDocuments({ product: productId });

    return {
      reviews,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  static async updateProductRating(productId: string) {
    const stats = await Review.aggregate([
      { $match: { product: new Types.ObjectId(productId) } },
      {
        $group: {
          _id: '$product',
          averageRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 },
        }
      }
    ]);

    if (stats.length > 0) {
      await Product.findByIdAndUpdate(productId, {
        averageRating: Math.round(stats[0].averageRating * 10) / 10,
        reviewCount: stats[0].reviewCount,
      });
    } else {
      await Product.findByIdAndUpdate(productId, {
        averageRating: 0,
        reviewCount: 0,
      });
    }
  }
}
