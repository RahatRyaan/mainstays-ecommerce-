import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ICartItem {
  product: Types.ObjectId;
  variantId: Types.ObjectId;
  quantity: number;
}

export interface ICart extends Document {
  user: Types.ObjectId;
  items: ICartItem[];
  appliedCoupon?: Types.ObjectId;
  status: 'active' | 'abandoned';
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  variantId: { type: Schema.Types.ObjectId, required: true },
  quantity: { type: Number, required: true, min: 1 },
});

const CartSchema = new Schema<ICart>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [CartItemSchema],
    appliedCoupon: { type: Schema.Types.ObjectId, ref: 'Coupon' },
    status: { type: String, enum: ['active', 'abandoned'], default: 'active' },
  },
  {
    timestamps: true,
  }
);

export const Cart = mongoose.model<ICart>('Cart', CartSchema);
