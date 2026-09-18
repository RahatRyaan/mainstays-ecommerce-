import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IInventoryLog extends Document {
  product: Types.ObjectId;
  variantId: Types.ObjectId;
  type: 'deduction' | 'restock' | 'adjustment';
  quantity: number;
  reason: string;
  performedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const InventoryLogSchema = new Schema<IInventoryLog>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    variantId: { type: Schema.Types.ObjectId, required: true }, // refers to VariantSchema _id
    type: {
      type: String,
      enum: ['deduction', 'restock', 'adjustment'],
      required: true,
    },
    quantity: { type: Number, required: true },
    reason: { type: String, required: true },
    performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
  }
);

export const InventoryLog = mongoose.model<IInventoryLog>(
  'InventoryLog',
  InventoryLogSchema
);
