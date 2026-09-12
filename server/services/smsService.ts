import db from '../db/database';
import { jobService } from './jobService';

export interface ProcessReplyResult {
  success: boolean;
  jobId: string;
  workerId: string;
  newState: string;
  replySent?: string;
  isDuplicate?: boolean;
}

export class SMSService {
  /**
   * Helper to retrieve worker name and phone
   */
  private getWorkerInfo(workerId: string) {
    const fl = db.prepare(`
      SELECT u.name, u.phone 
      FROM freelancers f
      JOIN users u ON u.id = f.user_id
      WHERE f.freelancer_id = ? OR f.user_id = ?
    `).get(workerId, workerId) as any;

    return {
      name: fl?.name || 'Worker',
      phone: fl?.phone || '+91 98000 00000'
    };
  }

  /**
   * Dispatch initial opportunity SMS alerts to candidate workers
   */
  dispatchOpportunities(jobId: string, customerId: string, workerIds: string[]) {
    const job = jobService.getJobById(jobId);
    if (!job) throw new Error('Job not found.');
    if (job.customerId !== customerId) {
      throw new Error('Unauthorized: Only the posting customer can dispatch work alerts.');
    }

    return db.transaction(() => {
      // 1. Update job status to sms_sent
      db.prepare("UPDATE jobs SET status = 'sms_sent', updated_at = datetime('now') WHERE id = ?").run(jobId);

      const createdApps = [];

      for (const workerId of workerIds) {
        const info = this.getWorkerInfo(workerId);
        const appId = `app-${jobId}-${workerId}`;

        // Upsert job application
        db.prepare(`
          INSERT INTO job_applications (
            id, job_id, worker_id, status, sms_state, sent_at, created_at, updated_at
          ) VALUES (
            ?, ?, ?, 'sms_sent', 'WAITING_FOR_DETAILS_REQUEST', datetime('now'), datetime('now'), datetime('now')
          )
          ON CONFLICT(job_id, worker_id) DO UPDATE SET
            status = 'sms_sent',
            sms_state = 'WAITING_FOR_DETAILS_REQUEST',
            updated_at = datetime('now')
        `).run(appId, jobId, workerId);

        // Record Outgoing SMS Event
        const smsId = `sms-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        const smsContent = `NEW OPPORTUNITY: ${job.title} in ${job.location}. Wage: ₹${job.paymentAmount}/day. Reply 1 for details or 0 to decline.`;

        db.prepare(`
          INSERT INTO sms_messages (
            id, job_id, worker_id, worker_name, worker_phone, direction, content, step, status, timestamp, created_at
          ) VALUES (
            ?, ?, ?, ?, ?, 'outgoing', ?, 'opportunity', 'sent', datetime('now'), datetime('now')
          )
        `).run(smsId, jobId, workerId, info.name, info.phone, smsContent);

        createdApps.push({ id: appId, jobId, workerId, status: 'sms_sent' });
      }

      return {
        job: jobService.getJobById(jobId),
        dispatchedCount: workerIds.length,
        applications: createdApps
      };
    })();
  }

  /**
   * Process incoming worker SMS reply (1, 0, or custom) with strict idempotency
   */
  processWorkerReply(
    jobId: string,
    workerId: string,
    replyText: string,
    providerMessageId?: string
  ): ProcessReplyResult {
    const job = jobService.getJobById(jobId);
    if (!job) throw new Error('Job not found.');

    // Idempotency check: Protect against webhook retries
    if (providerMessageId) {
      const existing = db.prepare('SELECT id FROM sms_messages WHERE provider_message_id = ?').get(providerMessageId);
      if (existing) {
        return {
          success: true,
          jobId,
          workerId,
          newState: 'IDEMPOTENT_IGNORE',
          isDuplicate: true
        };
      }
    }

    const app = db.prepare('SELECT * FROM job_applications WHERE job_id = ? AND worker_id = ?').get(jobId, workerId) as any;
    if (!app) {
      throw new Error(`No application opportunity found for worker ${workerId} on job ${jobId}.`);
    }

    const info = this.getWorkerInfo(workerId);
    const cleanReply = replyText.trim();

    return db.transaction(() => {
      // 1. Record Inbound SMS
      const inboundSmsId = `sms-in-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      db.prepare(`
        INSERT INTO sms_messages (
          id, job_id, worker_id, worker_name, worker_phone, direction, content, step, status, provider_message_id, timestamp, created_at
        ) VALUES (
          ?, ?, ?, ?, ?, 'incoming', ?, 'reply', 'received', ?, datetime('now'), datetime('now')
        )
      `).run(inboundSmsId, jobId, workerId, info.name, info.phone, cleanReply, providerMessageId || null);

      let nextAppStatus = app.status;
      let nextSmsState = app.sms_state;
      let outgoingContent = '';
      let stepName = 'system';

      const currentState = app.sms_state || 'WAITING_FOR_DETAILS_REQUEST';

      // 2. Evaluate State Transitions
      if (currentState === 'WAITING_FOR_DETAILS_REQUEST' || app.status === 'sms_sent') {
        if (cleanReply === '1') {
          nextAppStatus = 'details_sent';
          nextSmsState = 'WAITING_FOR_ACCEPTANCE';
          stepName = 'details';
          outgoingContent = `JOB DETAILS: "${job.title}". Location: ${job.location}. Duration: ${job.durationDays} day(s). Reporting: ${job.reportingTime}. Wage: ₹${job.paymentAmount}/day. Reply 1 to accept or 0 to decline.`;
        } else if (cleanReply === '0') {
          nextAppStatus = 'rejected';
          nextSmsState = 'REJECTED';
          stepName = 'rejected';
          outgoingContent = `Understood. You declined "${job.title}". We will notify you of future matching opportunities.`;
        } else {
          nextAppStatus = 'invalid_response';
          outgoingContent = `Invalid reply "${cleanReply}". Please reply 1 for job details or 0 to decline.`;
        }
      } else if (currentState === 'WAITING_FOR_ACCEPTANCE' || app.status === 'details_sent') {
        if (cleanReply === '1') {
          nextAppStatus = 'accepted';
          nextSmsState = 'ACCEPTED';
          stepName = 'accepted';
          outgoingContent = `TERMS ACCEPTED! You have accepted "${job.title}". Waiting for final client assignment. Keep your phone ready.`;

          // Update job status to responses_received if still sms_sent
          if (job.status === 'sms_sent' || job.status === 'open') {
            db.prepare("UPDATE jobs SET status = 'responses_received', updated_at = datetime('now') WHERE id = ?").run(jobId);
          }
        } else if (cleanReply === '0') {
          nextAppStatus = 'rejected';
          nextSmsState = 'REJECTED';
          stepName = 'rejected';
          outgoingContent = `Understood. You declined the terms for "${job.title}". Thank you.`;
        } else {
          nextAppStatus = 'invalid_response';
          outgoingContent = `Invalid reply "${cleanReply}". Please reply 1 to accept terms or 0 to decline.`;
        }
      } else {
        outgoingContent = `This opportunity is currently ${app.status}. Thank you for contacting Shramik.`;
      }

      // 3. Update Application State
      db.prepare(`
        UPDATE job_applications
        SET status = ?, sms_state = ?, responded_at = datetime('now'), updated_at = datetime('now')
        WHERE job_id = ? AND worker_id = ?
      `).run(nextAppStatus, nextSmsState, jobId, workerId);

      // 4. Record Outbound SMS Response
      if (outgoingContent) {
        const outboundSmsId = `sms-out-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        db.prepare(`
          INSERT INTO sms_messages (
            id, job_id, worker_id, worker_name, worker_phone, direction, content, step, status, timestamp, created_at
          ) VALUES (
            ?, ?, ?, ?, ?, 'outgoing', ?, ?, 'sent', datetime('now'), datetime('now')
          )
        `).run(outboundSmsId, jobId, workerId, info.name, info.phone, outgoingContent, stepName);
      }

      return {
        success: true,
        jobId,
        workerId,
        newState: nextAppStatus,
        replySent: outgoingContent
      };
    })();
  }

  /**
   * Get chronological SMS event log
   */
  getSMSLogs(jobId?: string, limit = 100) {
    let query = 'SELECT * FROM sms_messages ';
    const params: any[] = [];

    if (jobId) {
      query += 'WHERE job_id = ? ';
      params.push(jobId);
    }

    query += 'ORDER BY created_at DESC LIMIT ?';
    params.push(limit);

    const rows = db.prepare(query).all(...params) as any[];

    return rows.map(r => ({
      id: r.id,
      jobId: r.job_id,
      workerId: r.worker_id,
      workerName: r.worker_name,
      workerPhone: r.worker_phone,
      direction: r.direction,
      content: r.content,
      step: r.step,
      status: r.status,
      timestamp: r.timestamp,
      createdAt: r.created_at
    }));
  }

  /**
   * Get applications for job or worker
   */
  getApplications(jobId?: string, workerId?: string) {
    let query = 'SELECT * FROM job_applications ';
    const conditions: string[] = [];
    const params: any[] = [];

    if (jobId) {
      conditions.push('job_id = ?');
      params.push(jobId);
    }
    if (workerId) {
      conditions.push('worker_id = ?');
      params.push(workerId);
    }

    if (conditions.length > 0) {
      query += `WHERE ${conditions.join(' AND ')} `;
    }

    query += 'ORDER BY created_at DESC';

    const rows = db.prepare(query).all(...params) as any[];

    return rows.map(r => ({
      id: r.id,
      jobId: r.job_id,
      workerId: r.worker_id,
      status: r.status,
      smsState: r.sms_state,
      sentAt: r.sent_at,
      respondedAt: r.responded_at,
      assignedAt: r.assigned_at,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }));
  }
}

export const smsService = new SMSService();
