import { Request, Response } from 'express';
import { OrderService } from '../services/order.service';
import { Order } from '../models/Order';
import { SubOrder } from '../models/SubOrder';
import { PaymentService } from '../services/payment.service';

export class OrderController {
  static async createOrder(req: Request, res: Response) {
    try {
      const { shippingAddress, vendorItems, items, totalAmount, paymentMethod } = req.body;
      const result = await OrderService.createOrder(
        req.user!.id,
        shippingAddress,
        { vendorItems, items, totalAmount, paymentMethod }
      );
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async getMyOrders(req: Request, res: Response) {
    try {
      const orders = await Order.find({ user: req.user!.id }).sort({ createdAt: -1 }).lean();
      
      const orderIds = orders.map(o => o._id);
      const subOrders = await SubOrder.find({ parentOrder: { $in: orderIds } })
        .populate('vendor', 'name email')
        .populate('items.product', 'name images')
        .lean();

      const ordersWithItems = orders.map(order => {
        const orderSubOrders = subOrders.filter(so => so.parentOrder.toString() === order._id.toString());
        const vendorItems = orderSubOrders.map(so => ({
          vendor: so.vendor,
          status: so.status,
          subTotal: so.subTotal,
          items: so.items
        }));
        const status = orderSubOrders.length > 0 && orderSubOrders[0] ? orderSubOrders[0].status : (order.paymentStatus === 'paid' ? 'processing' : 'pending');
        return {
          ...order,
          status,
          vendorItems,
          subOrders: orderSubOrders,
        };
      });

      res.json({ success: true, data: { orders: ordersWithItems } });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getVendorOrders(req: Request, res: Response) {
    try {
      const subOrders = await SubOrder.find({ vendor: req.user!.id })
        .populate('parentOrder')
        .sort({ createdAt: -1 });
      res.json(subOrders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async updateSubOrderStatus(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const { status } = req.body;
      const subOrder = await OrderService.updateSubOrderStatus(req.user!.id, id, status);
      res.json(subOrder);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async handleWebhook(req: Request, res: Response) {
    try {
      const sig = req.headers['stripe-signature'] as string;
      const payload = req.body; // In real app, must be raw body!

      const event = PaymentService.verifyWebhookSignature(payload, sig, 'webhook_secret');
      
      await OrderService.handleWebhook(event);
      
      res.json({ received: true });
    } catch (error: any) {
      console.error('Webhook error:', error);
      res.status(400).json({ message: error.message });
    }
  }
}
