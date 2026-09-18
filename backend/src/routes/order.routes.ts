import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createOrderSchema, updateSubOrderStatusSchema } from '../validations/order.validation';
import bodyParser from 'body-parser';

const router = Router();

// Webhook needs to be before express.json() if we wanted raw body, 
// but for our mocked tests, JSON is fine.
router.post(
  '/webhook',
  bodyParser.text({ type: 'application/json' }), // For testing signature with text
  OrderController.handleWebhook
);

router.use(authenticate);

router.post(
  '/',
  validate(createOrderSchema),
  OrderController.createOrder
);

router.get('/my-orders', OrderController.getMyOrders);

router.get(
  '/vendor-orders',
  requireRole(['vendor', 'admin']),
  OrderController.getVendorOrders
);

router.put(
  '/sub-orders/:id/status',
  requireRole(['vendor']),
  validate(updateSubOrderStatusSchema),
  OrderController.updateSubOrderStatus
);

export default router;
