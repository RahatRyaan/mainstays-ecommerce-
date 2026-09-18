import { CartService } from './cart.service';
import { Product } from '../models/Product';
import { ICoupon } from '../models/Coupon';
import { Types } from 'mongoose';

export class CheckoutService {
  static async calculateTotals(userId: string) {
    const cart = await CartService.getCart(userId);
    
    if (!cart.items || cart.items.length === 0) {
      throw new Error('Cart is empty');
    }

    let subtotal = 0;
    const checkoutItems = [];

    for (const item of cart.items) {
      // product is populated
      const product = item.product as any; 
      
      // Find variant
      const variant = product.variants.find((v: any) => v._id.toString() === item.variantId.toString());
      
      if (!variant) {
        throw new Error(`Variant not found for product ${product.name}`);
      }

      if (variant.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name} (Variant: ${variant.sku}). Available: ${variant.stock}`);
      }

      const price = product.basePrice + variant.priceAdjustment;
      const itemTotal = price * item.quantity;
      subtotal += itemTotal;

      checkoutItems.push({
        product: product._id,
        variantId: variant._id,
        quantity: item.quantity,
        price,
        vendor: product.vendor,
      });
    }

    let discount = 0;
    if (cart.appliedCoupon) {
      const coupon = cart.appliedCoupon as any;
      if (subtotal >= coupon.minOrderValue) {
        if (coupon.type === 'percentage') {
          discount = (subtotal * coupon.discountValue) / 100;
        } else {
          discount = coupon.discountValue;
        }
      } else {
        throw new Error(`Minimum order value for coupon is ${coupon.minOrderValue}`);
      }
    }

    // Static rules
    const tax = (subtotal - discount) * 0.10; // 10% tax
    const shipping = (subtotal - discount) > 100 ? 0 : 10; // $10 shipping if under $100
    
    const total = subtotal - discount + tax + shipping;

    return {
      subtotal,
      discount,
      tax,
      shipping,
      total,
      items: checkoutItems,
      coupon: cart.appliedCoupon ? (cart.appliedCoupon as any).code : null,
    };
  }

  static async draftCheckout(userId: string) {
    // This will eventually create an Order document
    // For now, we return the calculated summary and validate everything is correct.
    const totals = await this.calculateTotals(userId);
    
    // Convert cart status if we were actually placing the order
    // In phase 4, we will create the order here and set cart to 'converted' or 'abandoned'
    
    return totals;
  }
}
