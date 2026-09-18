import { Router } from 'express';
import { CartController } from '../controllers/cart.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  cartItemSchema,
  updateCartItemSchema,
  applyCouponSchema,
} from '../validations/cart.validation';

const router = Router();

// All cart routes require authentication
router.use(authenticate);

router.get('/', CartController.getCart);

router.post(
  '/items',
  validate(cartItemSchema),
  CartController.addItem
);

router.put(
  '/items/:itemId',
  validate(updateCartItemSchema),
  CartController.updateItem
);

router.delete('/items/:itemId', CartController.removeItem);

router.post(
  '/coupon',
  validate(applyCouponSchema),
  CartController.applyCoupon
);

router.post('/checkout', CartController.checkout);

export default router;
