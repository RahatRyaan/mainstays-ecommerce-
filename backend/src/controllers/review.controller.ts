import { Request, Response } from 'express';
import { ReviewService } from '../services/review.service';
import { createReviewSchema } from '../validations/review.validation';

export const addReview = async (req: Request, res: Response) => {
  try {
    const productId = String(req.params.productId);
    const userId = req.user!.id;

    // Validate body
    const parsed = createReviewSchema.parse({ body: req.body });
    const { rating, comment } = parsed.body;

    const review = await ReviewService.addReview(userId, productId, rating, comment);

    res.status(201).json({ success: true, data: review });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }
    if (error.message && error.message.includes('delivered order')) {
      return res.status(403).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

export const getProductReviews = async (req: Request, res: Response) => {
  const productId = String(req.params.productId);
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const result = await ReviewService.getProductReviews(productId, page, limit);

  res.json({ success: true, data: result });
};
