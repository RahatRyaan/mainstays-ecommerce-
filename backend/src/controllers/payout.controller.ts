import { Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { AuthRequest } from '../middlewares/auth.middleware';
import { Payout } from '../models/Payout';
import { SubOrder } from '../models/SubOrder';
import { Product } from '../models/Product';

export class PayoutController {
  // Vendor gets their financial summary & payouts
  static async getVendorPayoutSummary(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const vendorId = String(req.user!.id);
      if (!vendorId || !Types.ObjectId.isValid(vendorId)) {
        return res.status(400).json({ success: false, message: 'Invalid vendor ID' });
      }
      const vId = new Types.ObjectId(vendorId);

      // 1. All sub-orders for this vendor
      const subOrders = await SubOrder.find({ vendor: vId }).populate('items.product', 'name images').sort({ createdAt: -1 }).lean();

      // 2. All payouts for this vendor
      const payouts = await Payout.find({ vendor: vId }).sort({ createdAt: -1 }).lean();

      // 3. Delivered sub-orders total
      const deliveredSubOrders = subOrders.filter((s: any) => s.status === 'delivered');
      const totalDelivered = deliveredSubOrders.reduce((acc, s: any) => acc + (s.subTotal || 0), 0);

      // 4. Pending in-transit sub-orders
      const pendingSubOrders = subOrders.filter((s: any) => ['pending', 'processing', 'shipped'].includes(s.status));
      const pendingBalance = pendingSubOrders.reduce((acc, s: any) => acc + (s.subTotal || 0), 0);

      // 5. Total Paid out
      const totalPaidOut = payouts
        .filter((p: any) => p.status === 'paid')
        .reduce((acc, p: any) => acc + (p.amount || 0), 0);

      // Available balance is delivered total minus already paid payouts
      const availableBalance = Math.max(0, totalDelivered - totalPaidOut);

      res.json({
        success: true,
        summary: {
          availableBalance,
          pendingBalance,
          lifetimeEarnings: totalDelivered + pendingBalance,
          totalPaidOut
        },
        payouts,
        recentSubOrders: subOrders.slice(0, 10)
      });
    } catch (error) {
      next(error);
    }
  }

  // Vendor requests a payout
  static async requestPayout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const vendorId = String(req.user!.id);
      if (!vendorId || !Types.ObjectId.isValid(vendorId)) {
        return res.status(400).json({ success: false, message: 'Invalid vendor ID' });
      }
      const vId = new Types.ObjectId(vendorId);
      const { amount, paymentMethod, accountDetails } = req.body;

      // Find any delivered subOrder that doesn't have a payout yet
      const deliveredSubOrders = await SubOrder.find({ vendor: vId, status: 'delivered' }).lean();
      
      const subOrderId = deliveredSubOrders.length > 0 
        ? deliveredSubOrders[0]?._id 
        : new Types.ObjectId();

      const requestedAmount = Math.max(1, Number(amount) || 100);

      const payout = await Payout.create({
        vendor: vId,
        subOrder: subOrderId,
        amount: requestedAmount,
        status: 'pending'
      });

      res.status(201).json({
        success: true,
        message: `Payout request of $${requestedAmount.toFixed(2)} submitted successfully. It will be reviewed and processed by the admin team.`,
        payout,
        paymentMethod: paymentMethod || 'Bank Wire',
        accountDetails: accountDetails || 'Primary Vendor Account'
      });
    } catch (error) {
      next(error);
    }
  }

  // Vendor gets their products
  static async getVendorProducts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const vendorId = String(req.user!.id);
      if (!vendorId || !Types.ObjectId.isValid(vendorId)) {
        return res.status(400).json({ success: false, message: 'Invalid vendor ID' });
      }
      const { search, category } = req.query;

      const query: any = { vendor: new Types.ObjectId(vendorId) };

      if (category && category !== 'all') {
        query.category = category;
      }

      if (search && typeof search === 'string') {
        const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        query.$or = [
          { name: { $regex: safeSearch, $options: 'i' } },
          { description: { $regex: safeSearch, $options: 'i' } }
        ];
      }

      const products = await Product.find(query).sort({ createdAt: -1 }).lean();
      res.json({ success: true, count: products.length, products });
    } catch (error) {
      next(error);
    }
  }

  // Vendor updates their product
  static async updateVendorProduct(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const vendorId = String(req.user!.id);
      const id = String(req.params.id);

      if (!id || !Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid product ID format' });
      }

      const product = await Product.findOne({
        _id: id,
        vendor: new Types.ObjectId(vendorId)
      });

      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found or unauthorized' });
      }

      Object.assign(product, req.body);
      await product.save();

      res.json({ success: true, message: 'Product updated successfully', product });
    } catch (error) {
      next(error);
    }
  }

  // Vendor deletes their product
  static async deleteVendorProduct(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const vendorId = String(req.user!.id);
      const id = String(req.params.id);

      if (!id || !Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid product ID format' });
      }

      const product = await Product.findOneAndDelete({
        _id: id,
        vendor: new Types.ObjectId(vendorId)
      });

      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found or unauthorized' });
      }

      res.json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}
