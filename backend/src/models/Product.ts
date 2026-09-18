import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IVariant {
  _id?: Types.ObjectId;
  sku: string;
  attributes: Record<string, string>; // e.g., { "size": "L", "color": "red" }
  priceAdjustment: number;
  stock: number;
  lowStockThreshold: number;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  vendor: Types.ObjectId;
  category: string;
  tags: string[];
  basePrice: number;
  images: string[];
  variants: IVariant[];
  isActive: boolean;
  averageRating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const VariantSchema = new Schema<IVariant>({
  sku: { type: String, required: true },
  attributes: { type: Map, of: String, default: {} },
  priceAdjustment: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },
  lowStockThreshold: { type: Number, default: 5 },
});

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true },
    vendor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, required: true },
    tags: [{ type: String }],
    basePrice: { type: Number, required: true, min: 0 },
    images: [{ type: String }],
    variants: [VariantSchema],
    isActive: { type: Boolean, default: true },
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

ProductSchema.index({ name: 'text', description: 'text', category: 'text', tags: 'text' });

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
