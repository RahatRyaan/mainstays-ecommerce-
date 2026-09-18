import { Product, IProduct } from '../models/Product';
import { Types } from 'mongoose';

export class ProductService {
  /**
   * Retrieves a paginated list of products.
   * Can be filtered by vendor, category, isActive, etc.
   */
  static async getProducts(filters: any = {}, skip: number = 0, limit: number = 20) {
    return await Product.find(filters)
      .skip(skip)
      .limit(limit)
      .populate('vendor', 'name email'); // only populate safe fields
  }

  /**
   * Retrieves a single product by ID.
   */
  static async getProductById(id: string) {
    return await Product.findById(id).populate('vendor', 'name email');
  }

  /**
   * Creates a new product for a specific vendor.
   */
  static async createProduct(vendorId: string, productData: Partial<IProduct>) {
    const product = new Product({
      ...productData,
      vendor: new Types.ObjectId(vendorId),
    });
    return await product.save();
  }

  /**
   * Updates an existing product. 
   * Validates vendor ownership unless the requester is an admin.
   */
  static async updateProduct(
    id: string,
    vendorId: string,
    isAdmin: boolean,
    updateData: Partial<IProduct>
  ) {
    const product = await Product.findById(id);
    if (!product) {
      throw new Error('Product not found');
    }

    if (!isAdmin && product.vendor.toString() !== vendorId) {
      throw new Error('Not authorized to update this product');
    }

    Object.assign(product, updateData);
    return await product.save();
  }

  /**
   * Deletes a product.
   * Validates vendor ownership unless the requester is an admin.
   */
  static async deleteProduct(id: string, vendorId: string, isAdmin: boolean) {
    const product = await Product.findById(id);
    if (!product) {
      throw new Error('Product not found');
    }

    if (!isAdmin && product.vendor.toString() !== vendorId) {
      throw new Error('Not authorized to delete this product');
    }

    await Product.deleteOne({ _id: id });
    return { success: true };
  }

  static async searchProducts(query: any) {
    const { 
      q, 
      search,
      category, 
      minPrice, 
      maxPrice, 
      minRating, 
      sort, 
      page = 1, 
      limit = 24 
    } = query;

    const searchTerm = q || search;
    const filter: any = { isActive: true };

    if (searchTerm && typeof searchTerm === 'string' && searchTerm.trim() !== '') {
      filter.$or = [
        { name: { $regex: searchTerm.trim(), $options: 'i' } },
        { description: { $regex: searchTerm.trim(), $options: 'i' } },
        { category: { $regex: searchTerm.trim(), $options: 'i' } },
        { tags: { $regex: searchTerm.trim(), $options: 'i' } },
      ];
    }
    
    if (category && category !== 'All') {
      filter.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }
    
    if (minPrice || maxPrice) {
      filter.basePrice = {};
      if (minPrice) filter.basePrice.$gte = Number(minPrice);
      if (maxPrice) filter.basePrice.$lte = Number(maxPrice);
    }
    
    if (minRating) {
      filter.averageRating = { $gte: Number(minRating) };
    }

    let sortObj: any = { createdAt: -1 };
    if (sort === 'price_asc' || sort === 'price-asc') sortObj = { basePrice: 1 };
    else if (sort === 'price_desc' || sort === 'price-desc') sortObj = { basePrice: -1 };
    else if (sort === 'rating_desc' || sort === 'rating') sortObj = { averageRating: -1 };
    else if (sort === 'newest') sortObj = { createdAt: -1 };

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 24));
    const skip = (pageNum - 1) * limitNum;

    const products = await Product.find(filter)
      .populate('vendor', 'name email')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);

    const total = await Product.countDocuments(filter);

    return {
      products,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
    };
  }
}
