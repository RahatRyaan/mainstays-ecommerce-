import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IReview extends Document {
  product: Types.ObjectId;
  user: Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

// One review per user per product
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

export const Review = mongoose.model<IReview>('Review', ReviewSchema);
