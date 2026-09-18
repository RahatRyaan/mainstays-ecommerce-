import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters long').max(50),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    role: z.enum(['customer', 'vendor', 'admin']).optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    deliveryAddress: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
    storeName: z.string().optional(),
    businessType: z.string().optional(),
    taxId: z.string().optional(),
    businessPhone: z.string().optional(),
    bankAccount: z.string().optional(),
    payoutEmail: z.string().optional(),
    bio: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    code: z.string().min(4, 'Reset verification code is required'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters long').optional(),
    password: z.string().min(6, 'Password must be at least 6 characters long').optional(),
    confirmPassword: z.string().optional(),
  }).refine((data) => !!(data.newPassword || data.password), {
    message: 'New password must be provided',
    path: ['newPassword'],
  }),
});
