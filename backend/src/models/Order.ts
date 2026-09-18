import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IOrder extends Document {
  user: Types.ObjectId;
  totalAmount: number;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  paymentIntentId?: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    totalAmount: { type: Number, required: true },
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    shipping: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    paymentIntentId: { type: String, unique: true, sparse: true }, // sparse allows multiple nulls
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    status: { 
      type: String, 
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], 
      default: 'processing' 
    },
    shippingAddress: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
