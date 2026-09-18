import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../validations/auth.validation';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { authLimiter } from '../middlewares/rateLimiter';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and User Management
 */

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/google', authLimiter, authController.googleLogin);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), authController.resetPassword);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Log out
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out
 */
router.post('/logout', authController.logout);

// Example protected route for testing RBAC
router.get('/me', authenticate, (req, res) => {
  res.json({ user: (req as any).user });
});

router.get('/admin-only', authenticate, requireRole(['admin']), (req, res) => {
  res.json({ message: 'Welcome admin' });
});

router.put('/profile', authenticate, authController.updateProfile);
router.put('/change-password', authenticate, authController.changePassword);
router.put('/upgrade-to-vendor', authenticate, authController.upgradeToVendor);

export default router;
