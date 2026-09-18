import { z } from 'zod';
import mongoose from 'mongoose';

export const createOrderSchema = z.object({
  body: z.object({
    shippingAddress: z.union([
      z.string().min(3, 'Shipping address must be at least 3 characters'),
      z.record(z.string(), z.any()),
    ]),
    items: z.array(z.any()).optional(),
    vendorItems: z.array(z.any()).optional(),
    totalAmount: z.number().optional(),
    paymentMethod: z.string().optional(),
  }).passthrough(),
});

export const updateSubOrderStatusSchema = z.object({
  params: z.object({
    id: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), { message: 'Invalid SubOrder ID' }),
  }),
  body: z.object({
    status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
  }),
});
