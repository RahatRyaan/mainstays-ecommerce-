import { Types } from 'mongoose';
import { Cart } from '../models/Cart';
import { Product } from '../models/Product';
import { Coupon } from '../models/Coupon';

export class CartService {
  static async getCart(userId: string) {
    let cart = await Cart.findOne({ user: userId }).populate('items.product').populate('appliedCoupon');
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }
    return cart;
  }

  static async addItem(userId: string, productId: string, variantId: string, quantity: number) {
    const cart = await this.getCart(userId);
    
    // Check if item already in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.product._id.toString() === productId && item.variantId.toString() === variantId
    );

    if (existingItemIndex > -1 && cart.items[existingItemIndex]) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({
        product: new Types.ObjectId(productId),
        variantId: new Types.ObjectId(variantId),
        quantity
      } as any);
    }

    await cart.save();
    return await this.getCart(userId); // Return populated cart
  }

  static async updateItemQuantity(userId: string, itemId: string, quantity: number) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) throw new Error('Cart not found');

    const item = (cart.items as any).id ? (cart.items as any).id(itemId) : cart.items.find((i: any) => i._id?.toString() === itemId);
    if (!item) throw new Error('Item not found in cart');

    item.quantity = quantity;
    await cart.save();
    return await this.getCart(userId);
  }

  static async removeItem(userId: string, itemId: string) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) throw new Error('Cart not found');

    if ((cart.items as any).pull) {
      (cart.items as any).pull({ _id: itemId });
    } else {
      cart.items = cart.items.filter((i: any) => i._id?.toString() !== itemId);
    }
    await cart.save();
    return await this.getCart(userId);
  }

  static async applyCoupon(userId: string, code: string) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) throw new Error('Cart not found');

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) throw new Error('Invalid or inactive coupon');

    if (coupon.expiresAt < new Date()) {
      throw new Error('Coupon is expired');
    }

    cart.appliedCoupon = coupon._id as Types.ObjectId;
    await cart.save();
    return await this.getCart(userId);
  }
}
