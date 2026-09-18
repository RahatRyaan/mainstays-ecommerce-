import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';

const router = Router();

// All admin routes require admin authentication
router.use(authenticate, requireRole(['admin']));

// Users & Vendors
router.get('/users', AdminController.getUsers);
router.get('/vendors', AdminController.getVendors);
router.patch('/users/:id/role', AdminController.updateUserRole);
router.delete('/users/:id', AdminController.deleteUser);

// Products Moderation
router.get('/products', AdminController.getProducts);
router.patch('/products/:id/status', AdminController.toggleProductStatus);
router.delete('/products/:id', AdminController.deleteProduct);

// Orders
router.get('/orders', AdminController.getOrders);
router.patch('/orders/:id/status', AdminController.updateOrderStatus);

// Coupons
router.get('/coupons', AdminController.getCoupons);
router.post('/coupons', AdminController.createCoupon);
router.patch('/coupons/:id/status', AdminController.toggleCouponStatus);
router.delete('/coupons/:id', AdminController.deleteCoupon);

// Payouts
router.get('/payouts', AdminController.getPayouts);
router.patch('/payouts/:id/pay', AdminController.processPayout);

export default router;
