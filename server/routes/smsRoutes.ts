import { Router, Response } from 'express';
import { smsService } from '../services/smsService';
import { requireAuth, requireRole, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// 1. Dispatch SMS Opportunities to Selected Workers
router.post('/dispatch', requireAuth, requireRole(['customer']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const customerId = req.user!.userId;
    const { jobId, workerIds } = req.body;
    if (!jobId || !Array.isArray(workerIds) || workerIds.length === 0) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'jobId and non-empty workerIds array are required.' } });
    }

    const result = smsService.dispatchOpportunities(jobId, customerId, workerIds);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: { code: 'DISPATCH_FAILED', message: err.message } });
  }
});

// 2. Incoming SMS Webhook (Twilio / Gateway integration with Idempotency)
router.post('/webhook', (req, res) => {
  try {
    const { jobId, workerId, message, providerMessageId } = req.body;
    if (!jobId || !workerId || message === undefined) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'jobId, workerId, and message are required.' } });
    }

    const result = smsService.processWorkerReply(jobId, workerId, String(message), providerMessageId);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: { code: 'WEBHOOK_FAILED', message: err.message } });
  }
});

// 3. Demo Simulate Worker Reply (invokes the exact same state machine!)
router.post('/simulate', (req, res) => {
  try {
    const { jobId, workerId, reply } = req.body;
    if (!jobId || !workerId || reply === undefined) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'jobId, workerId, and reply are required.' } });
    }

    const result = smsService.processWorkerReply(jobId, workerId, String(reply));
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: { code: 'SIMULATION_FAILED', message: err.message } });
  }
});

// 4. Retrieve SMS Logs
router.get('/logs', (req, res) => {
  try {
    const { jobId, limit } = req.query;
    const logs = smsService.getSMSLogs(jobId as string, limit ? Number(limit) : undefined);
    res.json({ logs });
  } catch (err: any) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// 5. Retrieve Applications
router.get('/applications', (req, res) => {
  try {
    const { jobId, workerId } = req.query;
    const applications = smsService.getApplications(jobId as string, workerId as string);
    res.json({ applications });
  } catch (err: any) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

export default router;
