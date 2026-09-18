import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ISubOrderItem {
  product: Types.ObjectId;
  variantId: Types.ObjectId;
  quantity: number;
  price: number;
}

export interface ISubOrder extends Document {
  parentOrder: Types.ObjectId;
  vendor: Types.ObjectId;
  items: ISubOrderItem[];
  subTotal: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const SubOrderItemSchema = new Schema<ISubOrderItem>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  variantId: { type: Schema.Types.ObjectId, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

const SubOrderSchema = new Schema<ISubOrder>(
  {
    parentOrder: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    vendor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [SubOrderItemSchema],
    subTotal: { type: Number, required: true },
    status: { 
      type: String, 
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], 
      default: 'pending' 
    },
  },
  {
    timestamps: true,
  }
);

export const SubOrder = mongoose.model<ISubOrder>('SubOrder', SubOrderSchema);
