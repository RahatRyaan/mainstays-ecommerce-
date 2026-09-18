import { Router } from 'express';
import { getVendorDashboard, getAdminDashboard } from '../controllers/dashboard.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

// Vendor Dashboard
router.get('/vendor', requireRole(['vendor']), getVendorDashboard);

// Admin Dashboard
router.get('/admin', requireRole(['admin']), getAdminDashboard);

export default router;
