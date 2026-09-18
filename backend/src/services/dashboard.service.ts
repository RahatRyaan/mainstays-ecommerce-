import { Types } from 'mongoose';
import { SubOrder } from '../models/SubOrder';
import { Payout } from '../models/Payout';
import { Order } from '../models/Order';
import { User } from '../models/User';

export class DashboardService {
  /**
   * Vendor Dashboard Stats:
   * - Total sales (sum of delivered subOrders subTotal)
   * - Active orders count (pending, processing, shipped)
   * - Pending payouts (sum of pending payouts)
   */
  static async getVendorStats(vendorId: string) {
    const vId = new Types.ObjectId(vendorId);

    const [salesResult] = await SubOrder.aggregate([
      { $match: { vendor: vId, status: 'delivered' } },
      { $group: { _id: null, totalSales: { $sum: '$subTotal' } } }
    ]);
    const totalSales = salesResult?.totalSales || 0;

    const activeOrdersCount = await SubOrder.countDocuments({
      vendor: vId,
      status: { $in: ['pending', 'processing', 'shipped'] }
    });

    const [payoutsResult] = await Payout.aggregate([
      { $match: { vendor: vId, status: 'pending' } },
      { $group: { _id: null, pendingPayouts: { $sum: '$amount' } } }
    ]);
    const pendingPayouts = payoutsResult?.pendingPayouts || 0;

    return {
      totalSales,
      activeOrdersCount,
      pendingPayouts,
    };
  }

  /**
   * Admin Dashboard Stats:
   * - Total platform volume (sum of all Order.totalAmount)
   * - Total active vendors
   * - Platform fee collection (Optional: placeholder if not storing fees explicitly)
   */
  static async getAdminStats() {
    const [volumeResult] = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, totalVolume: { $sum: '$totalAmount' } } }
    ]);
    const totalPlatformVolume = volumeResult?.totalVolume || 0;

    const totalActiveVendors = await User.countDocuments({
      role: 'vendor',
    });

    return {
      totalPlatformVolume,
      totalActiveVendors,
      platformFeeCollected: totalPlatformVolume * 0.05, // 5% mock fee for example
    };
  }
}
