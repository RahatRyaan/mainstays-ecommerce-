import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { DashboardService } from '../services/dashboard.service';

export const getVendorDashboard = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const vendorId = req.user?.id;
    if (!vendorId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const stats = await DashboardService.getVendorStats(vendorId);
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

export const getAdminDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await DashboardService.getAdminStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
};
