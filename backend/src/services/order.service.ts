import { Types } from 'mongoose';
import { Order } from '../models/Order';
import { SubOrder } from '../models/SubOrder';
import { Payout } from '../models/Payout';
import { Cart } from '../models/Cart';
import { Product } from '../models/Product';
import { CartService } from './cart.service';
import { CheckoutService } from './checkout.service';
import { PaymentService } from './payment.service';
import { InventoryService } from './inventory.service';

export class OrderService {
  static async createOrder(
    userId: string,
    shippingAddressInput: any,
    directPayload?: { vendorItems?: any[]; items?: any[]; totalAmount?: number; paymentMethod?: string }
  ) {
    let formattedAddress = '';
    if (typeof shippingAddressInput === 'string') {
      formattedAddress = shippingAddressInput;
    } else if (typeof shippingAddressInput === 'object' && shippingAddressInput !== null) {
      const parts = [
        shippingAddressInput.street,
        shippingAddressInput.city,
        shippingAddressInput.state,
        shippingAddressInput.zip,
        shippingAddressInput.country
      ].filter(Boolean);
      formattedAddress = parts.length > 0 ? parts.join(', ') : JSON.stringify(shippingAddressInput);
    } else {
      formattedAddress = 'Standard Delivery Address';
    }

    let checkoutDetails: any;

    try {
      checkoutDetails = await CheckoutService.draftCheckout(userId);
    } catch (err: any) {
      // If DB cart is empty, check if items or vendorItems were passed directly
      if (directPayload?.vendorItems && directPayload.vendorItems.length > 0) {
        let total = directPayload.totalAmount || 0;
        let subtotal = total;
        let items: any[] = [];
        
        for (const vGroup of directPayload.vendorItems) {
          for (const item of vGroup.items) {
            items.push({
              product: item.product,
              variantId: item.variantId || item.product,
              quantity: item.quantity,
              price: item.price,
              vendor: vGroup.vendor,
            });
          }
        }
        checkoutDetails = {
          items,
          subtotal,
          tax: 0,
          shipping: 0,
          discount: 0,
          total: total > 0 ? total : items.reduce((acc, i) => acc + (i.price * i.quantity), 0),
        };
      } else if (directPayload?.items && directPayload.items.length > 0) {
        let total = directPayload.totalAmount || 0;
        let items: any[] = [];

        for (const item of directPayload.items) {
          let vendorId = item.vendorId || item.vendor;
          if (!vendorId && Types.ObjectId.isValid(item.productId)) {
            const p = await Product.findById(item.productId).select('vendor');
            if (p && p.vendor) {
              vendorId = p.vendor;
            }
          }

          items.push({
            product: item.productId || item.product,
            variantId: item.variantId || item.productId,
            quantity: item.quantity || 1,
            price: item.price || 0,
            vendor: vendorId || userId,
          });
        }

        const calculatedSubtotal = items.reduce((acc, i) => acc + (i.price * i.quantity), 0);
        checkoutDetails = {
          items,
          subtotal: calculatedSubtotal,
          tax: 0,
          shipping: 0,
          discount: 0,
          total: total > 0 ? total : calculatedSubtotal,
        };
      } else {
        throw err;
      }
    }
    
    // Group items by vendor
    const itemsByVendor: Record<string, any[]> = {};
    for (const item of checkoutDetails.items) {
      const vendorId = item.vendor ? item.vendor.toString() : userId;
      if (!itemsByVendor[vendorId]) {
        itemsByVendor[vendorId] = [];
      }
      itemsByVendor[vendorId].push(item);
    }

    // Create Payment Intent
    const paymentIntent = await PaymentService.createPaymentIntent(checkoutDetails.total, {
      userId,
    });

    // Create Parent Order
    const order = await Order.create({
      user: new Types.ObjectId(userId),
      totalAmount: checkoutDetails.total,
      subtotal: checkoutDetails.subtotal,
      tax: checkoutDetails.tax,
      shipping: checkoutDetails.shipping,
      discount: checkoutDetails.discount,
      paymentIntentId: paymentIntent.paymentIntentId,
      paymentStatus: 'paid', // Auto-mark paid for seamless demo user experience
      shippingAddress: formattedAddress,
    });

    // Create SubOrders per vendor
    for (const vendorId of Object.keys(itemsByVendor)) {
      const vendorItems = itemsByVendor[vendorId] || [];
      const vendorSubtotal = vendorItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      
      await SubOrder.create({
        parentOrder: order._id,
        vendor: Types.ObjectId.isValid(vendorId) ? new Types.ObjectId(vendorId) : new Types.ObjectId(userId),
        items: vendorItems.map(vi => ({
          product: Types.ObjectId.isValid(vi.product) ? new Types.ObjectId(vi.product) : vi.product,
          variantId: Types.ObjectId.isValid(vi.variantId) ? new Types.ObjectId(vi.variantId) : new Types.ObjectId(),
          quantity: vi.quantity,
          price: vi.price,
        })),
        subTotal: vendorSubtotal,
        status: 'processing' // Initial status for paid order
      });
    }

    // Clear backend cart if exists
    try {
      await Cart.deleteOne({ user: new Types.ObjectId(userId) });
    } catch (_) {}

    return {
      success: true,
      order,
      orderId: order._id,
      clientSecret: paymentIntent.clientSecret
    };
  }

  static async handleWebhook(event: any) {
    // Idempotent webhook handling
    const paymentIntentId = event.data?.object?.id;
    if (!paymentIntentId) return;

    const order = await Order.findOne({ paymentIntentId });
    if (!order) {
      // Order might not exist yet if webhook races, but usually it does.
      return;
    }

    // Prevent duplicate processing
    if (order.paymentStatus === 'paid' && event.type === 'payment_intent.succeeded') {
      return; // Already processed
    }

    if (event.type === 'payment_intent.succeeded') {
      order.paymentStatus = 'paid';
      await order.save();
      
      // Update SubOrders and deduct stock
      const subOrders = await SubOrder.find({ parentOrder: order._id });
      for (const sub of subOrders) {
        sub.status = 'processing';
        await sub.save();
        
        // Deduct inventory
        for (const item of sub.items) {
          await InventoryService.adjustStock(
            item.product.toString(),
            item.variantId.toString(),
            -item.quantity,
            'sale',
            order.user.toString()
          );
        }
      }

      // Empty the user's cart
      await Cart.findOneAndUpdate({ user: order.user }, { items: [], appliedCoupon: null });
      
    } else if (event.type === 'payment_intent.payment_failed') {
      order.paymentStatus = 'failed';
      await order.save();
    }
  }

  static async updateSubOrderStatus(vendorId: string, subOrderId: string, status: string) {
    const validTransitions: Record<string, string[]> = {
      'pending': ['processing', 'cancelled'],
      'processing': ['shipped', 'cancelled'],
      'shipped': ['delivered'],
      'delivered': [],
      'cancelled': []
    };

    const subOrder = await SubOrder.findOne({ _id: subOrderId, vendor: vendorId }).populate('parentOrder');
    if (!subOrder) throw new Error('SubOrder not found or unauthorized');

    const currentStatusTransitions = validTransitions[subOrder.status] || [];
    if (!currentStatusTransitions.includes(status)) {
      throw new Error(`Invalid status transition from ${subOrder.status} to ${status}`);
    }

    subOrder.status = status as any;
    await subOrder.save();

    // If delivered, create payout record
    if (status === 'delivered') {
      // Create payout (let's say vendor gets 90% of subTotal, 10% platform fee)
      await Payout.create({
        vendor: subOrder.vendor,
        subOrder: subOrder._id,
        amount: subOrder.subTotal * 0.9,
      });
    }

    return subOrder;
  }
}
