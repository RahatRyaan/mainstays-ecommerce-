import { Request, Response } from 'express';
import { CartService } from '../services/cart.service';
import { CheckoutService } from '../services/checkout.service';

export class CartController {
  static async getCart(req: Request, res: Response) {
    try {
      const cart = await CartService.getCart(req.user!.id);
      res.json(cart);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async addItem(req: Request, res: Response) {
    try {
      const { productId, variantId, quantity } = req.body;
      const cart = await CartService.addItem(req.user!.id, productId, variantId, quantity);
      res.json(cart);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async updateItem(req: Request, res: Response) {
    try {
      const { quantity } = req.body;
      const itemId = String(req.params.itemId);
      const cart = await CartService.updateItemQuantity(req.user!.id, itemId, quantity);
      res.json(cart);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async removeItem(req: Request, res: Response) {
    try {
      const itemId = String(req.params.itemId);
      const cart = await CartService.removeItem(req.user!.id, itemId);
      res.json(cart);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async applyCoupon(req: Request, res: Response) {
    try {
      const { code } = req.body;
      const cart = await CartService.applyCoupon(req.user!.id, code);
      res.json(cart);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async checkout(req: Request, res: Response) {
    try {
      const checkoutDraft = await CheckoutService.draftCheckout(req.user!.id);
      res.json(checkoutDraft);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
