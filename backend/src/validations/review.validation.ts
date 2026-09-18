import { z } from 'zod';

export const createReviewSchema = z.object({
  body: z.object({
    rating: z.number().min(1).max(5),
    comment: z.string().min(5, 'Comment must be at least 5 characters long'),
  }),
});
