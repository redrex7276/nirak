import { Router, Response } from 'express';
import { jobService } from '../services/jobService';
import { smsService } from '../services/smsService';
import { requireAuth, requireRole, optionalAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// 1. List and Search Jobs
router.get('/', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { search, category, location, status, customerId, sort, page, limit } = req.query;

    const result = jobService.getJobs({
      search: search as string,
      category: category as string,
      location: location as string,
      status: status as string,
      customerId: customerId as string,
      sort: sort as any,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: { code: 'QUERY_FAILED', message: err.message } });
  }
});

// 2. Get Single Job by ID
router.get('/:id', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const job = jobService.getJobById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: { code: 'JOB_NOT_FOUND', message: 'Job not found.' } });
    }

    const applications = smsService.getApplications(job.id);
    res.json({ job, applications });
  } catch (err: any) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// 3. Create Job (Customer Only)
router.post('/', requireAuth, requireRole(['customer']), (req: AuthenticatedRequest, res: Response) => {
  try {
    // Derive customer ID directly from verified JWT session (never trust browser ID!)
    const customerId = req.user!.userId;
    const newJob = jobService.createJob(customerId, req.body);
    res.status(201).json({ job: newJob });
  } catch (err: any) {
    res.status(400).json({ error: { code: 'CREATION_FAILED', message: err.message } });
  }
});

// 4. Update Job
router.patch('/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const customerId = req.user!.userId;
    const updated = jobService.updateJob(req.params.id, customerId, req.body);
    res.json({ job: updated });
  } catch (err: any) {
    res.status(400).json({ error: { code: 'UPDATE_FAILED', message: err.message } });
  }
});

// 5. Cancel Job
router.post('/:id/cancel', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const customerId = req.user!.userId;
    const cancelled = jobService.cancelJob(req.params.id, customerId);
    res.json({ job: cancelled });
  } catch (err: any) {
    res.status(400).json({ error: { code: 'CANCELLATION_FAILED', message: err.message } });
  }
});

// 6. Assign Worker
router.post('/:id/assign', requireAuth, requireRole(['customer']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const customerId = req.user!.userId;
    const { workerId } = req.body;
    if (!workerId) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'workerId is required.' } });
    }

    const assignedJob = jobService.assignWorker(req.params.id, customerId, workerId);
    res.json({ job: assignedJob });
  } catch (err: any) {
    res.status(400).json({ error: { code: 'ASSIGNMENT_FAILED', message: err.message } });
  }
});

// 7. Complete Work
router.post('/:id/complete', requireAuth, requireRole(['customer']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const customerId = req.user!.userId;
    const completedJob = jobService.completeJob(req.params.id, customerId);
    res.json({ job: completedJob });
  } catch (err: any) {
    res.status(400).json({ error: { code: 'COMPLETION_FAILED', message: err.message } });
  }
});

// 8. Get Job Applications
router.get('/:id/applications', (req, res) => {
  try {
    const applications = smsService.getApplications(req.params.id);
    res.json({ applications });
  } catch (err: any) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

export default router;
