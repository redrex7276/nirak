import { describe, it, expect, beforeAll } from 'vitest';
import { authService } from '../server/services/authService';
import { jobService } from '../server/services/jobService';
import { freelancerService } from '../server/services/freelancerService';
import { smsService } from '../server/services/smsService';
import { dashboardService } from '../server/services/dashboardService';
import { runMigrations } from '../server/db/migrations';
import { runSeed } from '../server/db/seed';
import db from '../server/db/database';

describe('Shramik-Quote Backend & Relational Database Test Suite', () => {
  beforeAll(() => {
    runMigrations();
    runSeed();
  });

  // 1. Authentication Tests
  describe('Authentication & Password Security', () => {
    const testCustomerEmail = `test.cust.${Date.now()}@test.com`;
    const testPhone = `+91 99999 ${Math.floor(10000 + Math.random() * 90000)}`;

    it('successfully registers a customer with hashed password', () => {
      const result = authService.registerCustomer({
        name: 'Vikas Sharma',
        email: testCustomerEmail,
        phone: testPhone,
        password: 'securePassword123',
        organization: 'Vikas Builders'
      });

      expect(result.user).toBeDefined();
      expect(result.user.role).toBe('customer');
      expect(result.user.email).toBe(testCustomerEmail);
      expect(result.token).toBeDefined();

      // Ensure password is not stored in plaintext
      const userRow = db.prepare('SELECT password_hash, salt FROM users WHERE id = ?').get(result.user.id) as any;
      expect(userRow.password_hash).not.toBe('securePassword123');
      expect(userRow.salt).toBeDefined();
    });

    it('rejects duplicate email registration', () => {
      expect(() => {
        authService.registerCustomer({
          name: 'Duplicate Vikas',
          email: testCustomerEmail,
          phone: '+91 99999 00000',
          password: 'password123'
        });
      }).toThrow(/already exists/i);
    });

    it('successfully logs in with valid credentials and returns JWT', () => {
      const result = authService.login(testCustomerEmail, 'securePassword123');
      expect(result.user.email).toBe(testCustomerEmail);
      expect(result.token).toBeDefined();
    });

    it('rejects login with invalid password', () => {
      expect(() => {
        authService.login(testCustomerEmail, 'wrongPassword');
      }).toThrow(/incorrect password/i);
    });
  });

  // 2. Jobs & Search Tests
  describe('Jobs & Database-Level Search', () => {
    let createdJobId = '';

    it('creates a persistent job opportunity for a customer', () => {
      const newJob = jobService.createJob('cust-1', {
        title: 'Emergency Pipeline Overhaul Siolim',
        category: 'Plumber',
        description: 'Underground PVC line replacement across commercial property.',
        location: 'Siolim, Goa',
        startDate: '2026-09-30',
        durationDays: 3,
        reportingTime: '08:00 AM',
        workersRequired: 2,
        paymentType: 'daily',
        paymentAmount: 850,
        skills: ['PPR Pipe Welded Joint', 'Pressure Testing']
      });

      expect(newJob).toBeDefined();
      expect(newJob.title).toBe('Emergency Pipeline Overhaul Siolim');
      expect(newJob.status).toBe('open');
      createdJobId = newJob.id;

      // Verify row in SQLite database directly
      const dbJob = db.prepare('SELECT * FROM jobs WHERE id = ?').get(createdJobId) as any;
      expect(dbJob).toBeDefined();
      expect(dbJob.payment_amount).toBe(850);
    });

    it('queries jobs from database by keyword (search=pipeline)', () => {
      const res = jobService.getJobs({ search: 'pipeline' });
      expect(res.total).toBeGreaterThanOrEqual(1);
      expect(res.jobs.some(j => j.title.includes('Pipeline'))).toBe(true);
    });

    it('queries jobs from database by location (location=siolim)', () => {
      const res = jobService.getJobs({ location: 'siolim' });
      expect(res.total).toBeGreaterThanOrEqual(1);
      expect(res.jobs.some(j => j.location.includes('Siolim'))).toBe(true);
    });

    it('queries jobs from database by category (category=Plumber)', () => {
      const res = jobService.getJobs({ category: 'Plumber' });
      expect(res.jobs.every(j => j.category === 'Plumber')).toBe(true);
    });

    it('enforces ownership: non-owner cannot modify job', () => {
      expect(() => {
        jobService.updateJob(createdJobId, 'cust-2', { title: 'Hacked Title' });
      }).toThrow(/unauthorized/i);
    });
  });

  // 3. Freelancer Directory & Search
  describe('Freelancer Directory & Search', () => {
    it('retrieves verified freelancers from database', () => {
      const res = freelancerService.getFreelancers();
      expect(res.total).toBeGreaterThanOrEqual(4);
    });

    it('filters freelancers by skill keyword (skill=PPR)', () => {
      const res = freelancerService.getFreelancers({ skill: 'PPR' });
      expect(res.total).toBeGreaterThanOrEqual(1);
      expect(res.freelancers[0].name).toBe('Sunil Gaonkar');
    });

    it('updates freelancer availability state in database', () => {
      freelancerService.updateAvailability('worker-1', 'busy');
      const updated = freelancerService.getFreelancerById('worker-1');
      expect(updated.availability).toBe('busy');

      // Reset back to available
      freelancerService.updateAvailability('worker-1', 'available');
    });
  });

  // 4. SMS 2-Way State Machine & Idempotency
  describe('SMS Opportunity Dispatch, State Machine & Idempotency', () => {
    const testJobId = 'job-sms-test-1';

    beforeAll(() => {
      // Insert test job for SMS flow
      db.prepare(`
        INSERT OR REPLACE INTO jobs (
          id, customer_id, customer_name, customer_phone, title, category, description,
          location, start_date, duration_days, reporting_time, workers_required,
          payment_type, payment_amount, status, created_at, updated_at
        ) VALUES (
          ?, 'cust-1', 'Rajesh Sharma', '+91 98200 11223', 'Facade Painting', 'Painter',
          'Villa exterior', 'Mapusa, Goa', '2026-10-01', 2, '08:00 AM', 1,
          'daily', 800, 'open', datetime('now'), datetime('now')
        )
      `).run(testJobId);
    });

    it('dispatches opportunity SMS and transitions application to WAITING_FOR_DETAILS_REQUEST', () => {
      const dispatch = smsService.dispatchOpportunities(testJobId, 'cust-1', ['SQ-F-1042']);
      expect(dispatch.dispatchedCount).toBe(1);

      const app = db.prepare('SELECT * FROM job_applications WHERE job_id = ? AND worker_id = ?').get(testJobId, 'SQ-F-1042') as any;
      expect(app.status).toBe('sms_sent');
      expect(app.sms_state).toBe('WAITING_FOR_DETAILS_REQUEST');
    });

    it('worker replies "1": transitions state to WAITING_FOR_ACCEPTANCE with details SMS', () => {
      const res = smsService.processWorkerReply(testJobId, 'SQ-F-1042', '1');
      expect(res.success).toBe(true);
      expect(res.newState).toBe('details_sent');
      expect(res.replySent).toContain('JOB DETAILS');

      const app = db.prepare('SELECT * FROM job_applications WHERE job_id = ? AND worker_id = ?').get(testJobId, 'SQ-F-1042') as any;
      expect(app.status).toBe('details_sent');
      expect(app.sms_state).toBe('WAITING_FOR_ACCEPTANCE');
    });

    it('worker replies "1": transitions state to ACCEPTED with confirmation SMS', () => {
      const res = smsService.processWorkerReply(testJobId, 'SQ-F-1042', '1');
      expect(res.success).toBe(true);
      expect(res.newState).toBe('accepted');
      expect(res.replySent).toContain('TERMS ACCEPTED');

      const app = db.prepare('SELECT * FROM job_applications WHERE job_id = ? AND worker_id = ?').get(testJobId, 'SQ-F-1042') as any;
      expect(app.status).toBe('accepted');
      expect(app.sms_state).toBe('ACCEPTED');
    });

    it('idempotency: ignores duplicate provider message ID without duplicating records', () => {
      const providerMsgId = 'msg-twilio-unique-9988';
      const firstCall = smsService.processWorkerReply(testJobId, 'SQ-F-1042', '1', providerMsgId);
      expect(firstCall.success).toBe(true);

      const duplicateCall = smsService.processWorkerReply(testJobId, 'SQ-F-1042', '1', providerMsgId);
      expect(duplicateCall.isDuplicate).toBe(true);
      expect(duplicateCall.newState).toBe('IDEMPOTENT_IGNORE');
    });
  });

  // 5. Assignment, Quota & History Persistence
  describe('Assignment & Work Completion Ledger', () => {
    const assignJobId = 'job-assign-test-1';

    beforeAll(() => {
      db.prepare(`
        INSERT OR REPLACE INTO jobs (
          id, customer_id, customer_name, customer_phone, title, category, description,
          location, start_date, duration_days, reporting_time, workers_required,
          payment_type, payment_amount, status, created_at, updated_at
        ) VALUES (
          ?, 'cust-1', 'Rajesh Sharma', '+91 98200 11223', 'Tile Caulking Assagao', 'Plumber',
          'Kitchen tiles', 'Assagao, Goa', '2026-10-05', 1, '09:00 AM', 1,
          'daily', 850, 'open', datetime('now'), datetime('now')
        )
      `).run(assignJobId);

      // Pre-accept worker SQ-F-1052
      db.prepare(`
        INSERT OR REPLACE INTO job_applications (
          id, job_id, worker_id, status, sms_state, sent_at, created_at, updated_at
        ) VALUES (
          'app-test-assign', ?, 'SQ-F-1052', 'accepted', 'ACCEPTED', datetime('now'), datetime('now'), datetime('now')
        )
      `).run(assignJobId);
    });

    it('atomically assigns accepted worker and updates job status to assigned', () => {
      const assigned = jobService.assignWorker(assignJobId, 'cust-1', 'SQ-F-1052');
      expect(assigned.status).toBe('assigned');
      expect(assigned.assignedWorkerIds).toContain('SQ-F-1052');

      // Verify assignment table in SQLite
      const assignRow = db.prepare('SELECT * FROM assignments WHERE job_id = ? AND freelancer_id = ?').get(assignJobId, 'SQ-F-1052') as any;
      expect(assignRow).toBeDefined();
      expect(assignRow.status).toBe('assigned');
    });

    it('enforces assignment quota (rejects second worker when workersRequired = 1)', () => {
      // Pre-accept worker SQ-F-1045
      db.prepare(`
        INSERT OR REPLACE INTO job_applications (
          id, job_id, worker_id, status, sms_state, sent_at, created_at, updated_at
        ) VALUES (
          'app-test-quota', ?, 'SQ-F-1045', 'accepted', 'ACCEPTED', datetime('now'), datetime('now'), datetime('now')
        )
      `).run(assignJobId);

      expect(() => {
        jobService.assignWorker(assignJobId, 'cust-1', 'SQ-F-1045');
      }).toThrow(/quota reached/i);
    });

    it('completes job, records in work_history, and increments freelancer completed_jobs count', () => {
      const initialWorker = freelancerService.getFreelancerById('SQ-F-1052');
      const initialJobsCount = initialWorker.completedJobs;

      const completed = jobService.completeJob(assignJobId, 'cust-1');
      expect(completed.status).toBe('completed');

      // Verify work_history table
      const historyRows = freelancerService.getFreelancerHistory('SQ-F-1052');
      expect(historyRows.some(h => h.jobId === assignJobId)).toBe(true);

      // Verify freelancer profile increment
      const updatedWorker = freelancerService.getFreelancerById('SQ-F-1052');
      expect(updatedWorker.completedJobs).toBe(initialJobsCount + 1);
    });

    it('computes live customer dashboard stats accurately from database records', () => {
      const stats = dashboardService.getCustomerStats('cust-1');
      expect(stats.totalJobs).toBeGreaterThan(0);
      expect(stats.completedJobs).toBeGreaterThan(0);
    });
  });
});
