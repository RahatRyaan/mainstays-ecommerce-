import mongoose, { Document, Schema } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  type: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  expiresAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ['percentage', 'fixed'], required: true },
    discountValue: { type: Number, required: true, min: 0 },
    minOrderValue: { type: Number, default: 0, min: 0 },
    expiresAt: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export const Coupon = mongoose.model<ICoupon>('Coupon', CouponSchema);
