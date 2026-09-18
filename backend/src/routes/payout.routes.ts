import { Router } from 'express';
import { PayoutController } from '../controllers/payout.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';

const router = Router();

// Require vendor authentication for vendor payout/product routes
router.use(authenticate, requireRole(['vendor']));

// Payout summary and requests
router.get('/vendor', PayoutController.getVendorPayoutSummary);
router.post('/vendor/request', PayoutController.requestPayout);

// Vendor product management
router.get('/vendor/products', PayoutController.getVendorProducts);
router.patch('/vendor/products/:id', PayoutController.updateVendorProduct);
router.delete('/vendor/products/:id', PayoutController.deleteVendorProduct);

export default router;
