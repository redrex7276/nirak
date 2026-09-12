import { Router, Response } from 'express';
import { freelancerService } from '../services/freelancerService';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// 1. Search Freelancers
router.get('/', (req, res) => {
  try {
    const { search, skill, category, location, availability, page, limit } = req.query;

    const result = freelancerService.getFreelancers({
      search: search as string,
      skill: skill as string,
      category: category as string,
      location: location as string,
      availability: availability as string,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: { code: 'QUERY_FAILED', message: err.message } });
  }
});

// 2. Get Single Freelancer Profile
router.get('/:id', (req, res) => {
  try {
    const fl = freelancerService.getFreelancerById(req.params.id);
    if (!fl) {
      return res.status(404).json({ error: { code: 'FREELANCER_NOT_FOUND', message: 'Freelancer not found.' } });
    }
    res.json({ freelancer: fl });
  } catch (err: any) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// 3. Update Freelancer Profile
router.patch('/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const targetUserId = req.params.id;
    // Freelancer can only update their own profile unless admin
    if (req.user!.userId !== targetUserId && req.user!.role !== 'admin') {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'You can only update your own profile.' } });
    }

    const updated = freelancerService.updateFreelancerProfile(targetUserId, req.body);
    res.json({ freelancer: updated });
  } catch (err: any) {
    res.status(400).json({ error: { code: 'UPDATE_FAILED', message: err.message } });
  }
});

// 4. Update Worker Availability Toggle
router.patch('/:id/availability', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const targetUserId = req.params.id;
    if (req.user!.userId !== targetUserId && req.user!.role !== 'admin') {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'You can only update your own availability.' } });
    }

    const { availability } = req.body;
    if (!['available', 'busy', 'offline'].includes(availability)) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid availability state.' } });
    }

    const updated = freelancerService.updateAvailability(targetUserId, availability);
    res.json({ freelancer: updated });
  } catch (err: any) {
    res.status(400).json({ error: { code: 'UPDATE_FAILED', message: err.message } });
  }
});

// 5. Get Freelancer Work History
router.get('/:id/history', (req, res) => {
  try {
    const history = freelancerService.getFreelancerHistory(req.params.id);
    res.json({ history });
  } catch (err: any) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

export default router;
