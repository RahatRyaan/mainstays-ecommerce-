import { Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { AuthRequest } from '../middlewares/auth.middleware';
import { User } from '../models/User';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { SubOrder } from '../models/SubOrder';
import { Coupon } from '../models/Coupon';
import { Payout } from '../models/Payout';

export class AdminController {
  // ================= USERS MANAGEMENT =================
  static async getUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { search, role } = req.query;
      const query: any = {};

      if (role && role !== 'all') {
        query.role = role;
      }

      if (search && typeof search === 'string') {
        const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        query.$or = [
          { name: { $regex: safeSearch, $options: 'i' } },
          { email: { $regex: safeSearch, $options: 'i' } }
        ];
      }

      const users = await User.find(query).select('-password').sort({ createdAt: -1 }).lean();
      res.json({ success: true, count: users.length, users });
    } catch (error) {
      next(error);
    }
  }

  static async updateUserRole(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const { role } = req.body;

      if (!id || !Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid user ID format' });
      }

      if (!['customer', 'vendor', 'admin'].includes(role)) {
        return res.status(400).json({ success: false, message: 'Invalid role specified' });
      }

      const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-password');
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      res.json({ success: true, message: `User role updated to ${role}`, user });
    } catch (error) {
      next(error);
    }
  }

  static async deleteUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      if (!id || !Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid user ID format' });
      }

      if (req.user?.id === id) {
        return res.status(400).json({ success: false, message: 'Cannot delete your own admin account' });
      }

      const user = await User.findByIdAndDelete(id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      res.json({ success: true, message: 'User successfully deleted' });
    } catch (error) {
      next(error);
    }
  }

  // ================= PRODUCTS MODERATION =================
  static async getProducts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { category, search, status } = req.query;
      const query: any = {};

      if (category && category !== 'all') {
        query.category = category;
      }

      if (status === 'active') query.isActive = true;
      if (status === 'inactive') query.isActive = false;

      if (search && typeof search === 'string') {
        const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        query.$or = [
          { name: { $regex: safeSearch, $options: 'i' } },
          { description: { $regex: safeSearch, $options: 'i' } }
        ];
      }

      const products = await Product.find(query)
        .populate('vendor', 'name email')
        .sort({ createdAt: -1 })
        .lean();

      res.json({ success: true, count: products.length, products });
    } catch (error) {
      next(error);
    }
  }

  static async toggleProductStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      if (!id || !Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid product ID format' });
      }

      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      product.isActive = !product.isActive;
      await product.save();

      res.json({
        success: true,
        message: `Product ${product.isActive ? 'activated' : 'suspended'} successfully`,
        product
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteProduct(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      if (!id || !Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid product ID format' });
      }

      const product = await Product.findByIdAndDelete(id);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      res.json({ success: true, message: 'Product deleted from platform' });
    } catch (error) {
      next(error);
    }
  }

  // ================= GLOBAL ORDERS =================
  static async getOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { status } = req.query;
      const query: any = {};
      if (status && status !== 'all') {
        query.status = status;
      }

      const orders = await Order.find(query)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .lean();

      const populatedOrders = await Promise.all(
        orders.map(async (order: any) => {
          const subOrders = await SubOrder.find({ parentOrder: order._id })
            .populate('vendor', 'name email')
            .populate('items.product', 'name images basePrice')
            .lean();
          return {
            ...order,
            subOrders,
            vendorItems: subOrders
          };
        })
      );

      res.json({ success: true, count: populatedOrders.length, orders: populatedOrders });
    } catch (error) {
      next(error);
    }
  }

  static async updateOrderStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const { status } = req.body;

      if (!id || !Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid order ID format' });
      }

      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid order status specified' });
      }

      const order = await Order.findById(id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      order.status = status;
      await order.save();

      // Update associated subOrders if delivered or shipped or cancelled
      if (['shipped', 'delivered', 'cancelled'].includes(status)) {
        await SubOrder.updateMany({ parentOrder: id }, { status });
      }

      res.json({ success: true, message: `Order status updated to ${status}`, order });
    } catch (error) {
      next(error);
    }
  }

  // ================= COUPONS MANAGEMENT =================
  static async getCoupons(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
      res.json({ success: true, count: coupons.length, coupons });
    } catch (error) {
      next(error);
    }
  }

  static async createCoupon(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { code, type, discountValue, minOrderValue, expiresAt, isActive } = req.body;

      if (!code || !type || discountValue === undefined || !expiresAt) {
        return res.status(400).json({ success: false, message: 'Required fields missing' });
      }

      const sanitizedCode = String(code).toUpperCase().trim();
      const existing = await Coupon.findOne({ code: sanitizedCode });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Coupon code already exists' });
      }

      const coupon = await Coupon.create({
        code: sanitizedCode,
        type,
        discountValue: Number(discountValue),
        minOrderValue: Number(minOrderValue) || 0,
        expiresAt: new Date(expiresAt),
        isActive: isActive !== undefined ? isActive : true
      });

      res.status(201).json({ success: true, message: 'Coupon created successfully', coupon });
    } catch (error) {
      next(error);
    }
  }

  static async toggleCouponStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      if (!id || !Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid coupon ID format' });
      }

      const coupon = await Coupon.findById(id);
      if (!coupon) {
        return res.status(404).json({ success: false, message: 'Coupon not found' });
      }

      coupon.isActive = !coupon.isActive;
      await coupon.save();

      res.json({ success: true, message: `Coupon is now ${coupon.isActive ? 'Active' : 'Inactive'}`, coupon });
    } catch (error) {
      next(error);
    }
  }

  static async deleteCoupon(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      if (!id || !Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid coupon ID format' });
      }

      const coupon = await Coupon.findByIdAndDelete(id);
      if (!coupon) {
        return res.status(404).json({ success: false, message: 'Coupon not found' });
      }

      res.json({ success: true, message: 'Coupon deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ================= PAYOUTS MANAGEMENT =================
  static async getPayouts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const payouts = await Payout.find()
        .populate('vendor', 'name email')
        .populate('subOrder')
        .sort({ createdAt: -1 })
        .lean();

      res.json({ success: true, count: payouts.length, payouts });
    } catch (error) {
      next(error);
    }
  }

  static async processPayout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      if (!id || !Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid payout ID format' });
      }

      const payout = await Payout.findById(id);
      if (!payout) {
        return res.status(404).json({ success: false, message: 'Payout not found' });
      }

      payout.status = 'paid';
      await payout.save();

      res.json({ success: true, message: 'Payout marked as paid', payout });
    } catch (error) {
      next(error);
    }
  }

  // ================= VENDORS DIRECTORY =================
  static async getVendors(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const vendors = await User.find({ role: 'vendor' }).select('-password').sort({ createdAt: -1 }).lean();
      
      const enrichedVendors = await Promise.all(
        vendors.map(async (v) => {
          const productCount = await Product.countDocuments({ vendor: v._id });
          const [sales] = await SubOrder.aggregate([
            { $match: { vendor: v._id, status: 'delivered' } },
            { $group: { _id: null, total: { $sum: '$subTotal' } } }
          ]);
          const pendingOrders = await SubOrder.countDocuments({
            vendor: v._id,
            status: { $in: ['pending', 'processing', 'shipped'] }
          });
          return {
            ...v,
            productCount,
            totalSales: sales?.total || 0,
            pendingOrders,
          };
        })
      );

      res.json({ success: true, count: enrichedVendors.length, vendors: enrichedVendors });
    } catch (error) {
      next(error);
    }
  }
}

