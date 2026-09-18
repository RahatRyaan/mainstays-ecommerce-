import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  createProductSchema,
  updateProductSchema,
  adjustInventorySchema,
} from '../validations/product.validation';
import reviewRoutes from './review.routes';

const router = Router();

// Mount review routes
router.use('/:productId/reviews', reviewRoutes);

// Public routes
router.get('/', ProductController.getProducts);
router.get('/:id', ProductController.getProductById);

// Protected routes (Vendor and Admin)
router.use(authenticate);
router.use(requireRole(['vendor', 'admin']));

router.post(
  '/',
  validate(createProductSchema),
  ProductController.createProduct
);

router.put(
  '/:id',
  validate(updateProductSchema),
  ProductController.updateProduct
);

router.delete('/:id', ProductController.deleteProduct);

// Inventory adjustment
router.post(
  '/:id/inventory',
  validate(adjustInventorySchema),
  ProductController.adjustInventory
);

export default router;
