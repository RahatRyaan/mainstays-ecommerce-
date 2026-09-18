import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IPayout extends Document {
  vendor: Types.ObjectId;
  subOrder: Types.ObjectId;
  amount: number;
  status: 'pending' | 'paid';
  createdAt: Date;
  updatedAt: Date;
}

const PayoutSchema = new Schema<IPayout>(
  {
    vendor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subOrder: { type: Schema.Types.ObjectId, ref: 'SubOrder', required: true, unique: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  },
  {
    timestamps: true,
  }
);

export const Payout = mongoose.model<IPayout>('Payout', PayoutSchema);
