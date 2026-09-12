import { Router, Response } from 'express';
import { dashboardService } from '../services/dashboardService';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Customer Dashboard Metrics
router.get('/customer', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const customerId = req.user!.userId;
    const stats = dashboardService.getCustomerStats(customerId);
    res.json({ stats });
  } catch (err: any) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// Freelancer Dashboard Metrics
router.get('/freelancer', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const workerId = req.user!.userId;
    const stats = dashboardService.getFreelancerStats(workerId);
    res.json({ stats });
  } catch (err: any) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

export default router;
