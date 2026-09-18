import { z } from 'zod';
import mongoose from 'mongoose';

const objectIdValidator = z
  .string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: 'Invalid ObjectId',
  });

const variantSchema = z.object({
  sku: z.string().min(1, 'SKU is required'),
  attributes: z.record(z.string(), z.string()).optional(),
  priceAdjustment: z.number().optional(),
  stock: z.number().min(0, 'Stock cannot be negative').optional(),
  lowStockThreshold: z.number().min(0).optional(),
});

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().min(1, 'Description is required'),
    category: z.string().min(1, 'Category is required'),
    tags: z.array(z.string()).optional(),
    basePrice: z.number().min(0, 'Base price cannot be negative'),
    images: z.array(z.string()).optional(),
    variants: z
      .array(variantSchema)
      .min(1, 'At least one variant is required'),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    category: z.string().min(1).optional(),
    tags: z.array(z.string()).optional(),
    basePrice: z.number().min(0).optional(),
    images: z.array(z.string()).optional(),
    variants: z.array(variantSchema).optional(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({
    id: objectIdValidator,
  }),
});

export const adjustInventorySchema = z.object({
  body: z.object({
    variantId: objectIdValidator,
    quantity: z.number(), // Can be negative for deduction
    reason: z.string().min(1, 'Reason is required'),
  }),
  params: z.object({
    id: objectIdValidator, // Product ID
  }),
});
