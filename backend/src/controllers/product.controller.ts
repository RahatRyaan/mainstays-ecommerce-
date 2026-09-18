import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { ProductService } from '../services/product.service';
import { InventoryService } from '../services/inventory.service';
import slugify from 'slugify';

export class ProductController {
  static async getProducts(req: Request, res: Response) {
    try {
      const skip = parseInt(req.query.skip as string) || 0;
      const limit = parseInt(req.query.limit as string) || 20;
      const category = req.query.category as string;
      
      const filter: any = { isActive: true };
      if (category) filter.category = category;

      const products = await ProductService.getProducts(filter, skip, limit);
      const result = await ProductService.searchProducts(req.query);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getProductById(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      if (!id || !Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid product ID format' });
      }

      const product = await ProductService.getProductById(id);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      const prodObj = (product as any).toObject ? (product as any).toObject() : product;
      res.json({ success: true, data: { product: prodObj }, ...prodObj });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async createProduct(req: Request, res: Response) {
    try {
      // Req.user should be populated by authenticate middleware
      const vendorId = req.user!.id;
      
      // Auto-generate slug from name if not provided
      const productData = { ...req.body };
      if (!productData.slug) {
        productData.slug = slugify(productData.name, { lower: true, strict: true });
        productData.slug = `${productData.slug}-${Math.floor(Math.random() * 10000)}`;
      }

      const product = await ProductService.createProduct(vendorId, productData);
      res.status(201).json(product);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async updateProduct(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const isAdmin = req.user!.role === 'admin';
      const id = String(req.params.id);

      if (!id || !Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid product ID format' });
      }

      if (req.body.name) {
        req.body.slug = slugify(req.body.name, { lower: true, strict: true }) + '-' + Math.floor(Math.random() * 10000);
      }

      const product = await ProductService.updateProduct(
        id,
        userId,
        isAdmin,
        req.body
      );
      res.json(product);
    } catch (error: any) {
      const status = error.message.includes('Not authorized') ? 403 : 400;
      res.status(status).json({ message: error.message });
    }
  }

  static async deleteProduct(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const isAdmin = req.user!.role === 'admin';
      const id = String(req.params.id);

      if (!id || !Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid product ID format' });
      }

      await ProductService.deleteProduct(id, userId, isAdmin);
      res.status(204).send();
    } catch (error: any) {
      const status = error.message.includes('Not authorized') ? 403 : 400;
      res.status(status).json({ message: error.message });
    }
  }

  static async adjustInventory(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const isAdmin = req.user!.role === 'admin';
      const id = String(req.params.id);

      if (!id || !Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid product ID format' });
      }

      // First check authorization using ProductService
      const product = await ProductService.getProductById(id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      const vendor = product.vendor as any;
      if (!isAdmin && vendor?._id?.toString() !== userId && vendor?.toString() !== userId) {
        return res.status(403).json({ message: 'Not authorized to adjust this product\'s inventory' });
      }

      const { variantId, quantity, reason } = req.body;
      const result = await InventoryService.adjustStock(
        id,
        variantId,
        quantity,
        reason,
        userId
      );
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
