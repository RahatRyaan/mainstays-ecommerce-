import { Router } from 'express';
import * as reviewController from '../controllers/review.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router({ mergeParams: true }); // mergeParams to access productId from product routes

router.post('/', authenticate, reviewController.addReview);
router.get('/', reviewController.getProductReviews);

export default router;
