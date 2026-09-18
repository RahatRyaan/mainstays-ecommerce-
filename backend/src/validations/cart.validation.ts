import { z } from 'zod';
import mongoose from 'mongoose';

const objectIdValidator = z
  .string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: 'Invalid ObjectId',
  });

export const cartItemSchema = z.object({
  body: z.object({
    productId: objectIdValidator,
    variantId: objectIdValidator,
    quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  }),
});

export const updateCartItemSchema = z.object({
  body: z.object({
    quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  }),
  params: z.object({
    itemId: objectIdValidator,
  }),
});

export const applyCouponSchema = z.object({
  body: z.object({
    code: z.string().min(1, 'Coupon code is required'),
  }),
});
