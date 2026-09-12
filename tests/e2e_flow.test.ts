import { describe, it, expect, beforeAll } from 'vitest';
import { authService } from '../server/services/authService';
import { jobService } from '../server/services/jobService';
import { freelancerService } from '../server/services/freelancerService';
import { smsService } from '../server/services/smsService';
import { runMigrations } from '../server/db/migrations';
import { runSeed } from '../server/db/seed';
import db from '../server/db/database';

describe('Section 71: End-to-End Master Lifecycle Verification', () => {
  beforeAll(() => {
    runMigrations();
    runSeed();
  });

  const timestamp = Date.now();
  const customerEmail = `master.cust.${timestamp}@shramik.internal`;
  const customerPhone = `+91 98230 ${Math.floor(10000 + Math.random() * 90000)}`;
  let customerUser: any = null;
  let customerToken: string = '';
  let createdJob: any = null;
  let selectedFreelancer: any = null;
  let opportunityAppId: string = '';

  // 1. Customer Registration & Login
  it('CUSTOMER: Registers successfully with hashed credentials in SQLite', () => {
    const regResult = authService.registerCustomer({
      name: 'Pooja Naik',
      email: customerEmail,
      phone: customerPhone,
      password: 'StrongPassword456',
      organization: 'Naik Heritage Villas'
    });

    expect(regResult.user).toBeDefined();
    expect(regResult.user.name).toBe('Pooja Naik');
    expect(regResult.token).toBeDefined();

    // Verify database record
    const userInDb = db.prepare('SELECT id, role, password_hash FROM users WHERE email = ?').get(customerEmail) as any;
    expect(userInDb).toBeDefined();
    expect(userInDb.role).toBe('customer');
    expect(userInDb.password_hash).not.toBe('StrongPassword456');

    // Customer login
    const loginResult = authService.login(customerEmail, 'StrongPassword456');
    expect(loginResult.user.id).toBe(userInDb.id);
    customerUser = loginResult.user;
    customerToken = loginResult.token;
  });

  // 2. Job Creation (House Painting, Mapusa, 5 days, ₹800/day)
  it('CUSTOMER: Creates "House Painting" job in Mapusa (5 days, ₹800/day) and persists in DB', () => {
    createdJob = jobService.createJob(customerUser.id, {
      title: 'House Painting',
      category: 'Painter',
      description: 'Full interior and exterior painting for Portuguese villa in Mapusa.',
      location: 'Mapusa, Goa',
      startDate: '2026-10-01',
      durationDays: 5,
      reportingTime: '09:00 AM',
      workersRequired: 1,
      paymentType: 'daily',
      paymentAmount: 800
    });

    expect(createdJob).toBeDefined();
    expect(createdJob.id).toMatch(/^job-/i);
    expect(createdJob.title).toBe('House Painting');
    expect(createdJob.location).toBe('Mapusa, Goa');
    expect(createdJob.durationDays).toBe(5);
    expect(createdJob.paymentAmount).toBe(800);
    expect(createdJob.status).toBe('open');

    // Direct SQLite table verification
    const dbJob = db.prepare('SELECT * FROM jobs WHERE id = ?').get(createdJob.id) as any;
    expect(dbJob).toBeDefined();
    expect(dbJob.title).toBe('House Painting');
    expect(dbJob.payment_amount).toBe(800);
    expect(dbJob.duration_days).toBe(5);
  });

  // 3. Database Search: Keyword "Painting"
  it('SEARCH: Retrieves the job when searching by keyword "Painting"', () => {
    const searchRes = jobService.getJobs({
      search: 'Painting',
      customerId: customerUser.id
    });

    expect(searchRes.jobs.length).toBeGreaterThanOrEqual(1);
    const found = searchRes.jobs.find(j => j.id === createdJob.id);
    expect(found).toBeDefined();
    expect(found?.title).toBe('House Painting');
  });

  // 4. Database Search: Location "Mapusa"
  it('SEARCH: Retrieves the job when searching by location "Mapusa"', () => {
    const searchRes = jobService.getJobs({
      search: 'Mapusa',
      customerId: customerUser.id
    });

    expect(searchRes.jobs.length).toBeGreaterThanOrEqual(1);
    const found = searchRes.jobs.find(j => j.id === createdJob.id);
    expect(found).toBeDefined();
    expect(found?.location).toContain('Mapusa');
  });

  // 5. Freelancer Discovery & Opportunity SMS Dispatch
  it('OPPORTUNITY: Finds Painter in Mapusa and dispatches SMS opportunity', () => {
    const fSearch = freelancerService.getFreelancers({
      skill: 'Painter',
      location: 'Mapusa'
    });

    expect(fSearch.freelancers.length).toBeGreaterThanOrEqual(1);
    selectedFreelancer = fSearch.freelancers[0];
    expect(selectedFreelancer).toBeDefined();

    // Dispatch SMS Opportunity
    const dispatchRes = smsService.dispatchOpportunities(createdJob.id, customerUser.id, [selectedFreelancer.id]);
    expect(dispatchRes.dispatchedCount).toBe(1);

    // Verify opportunity record in DB
    const appRecord = db.prepare('SELECT * FROM job_applications WHERE job_id = ? AND worker_id = ?').get(
      createdJob.id,
      selectedFreelancer.id
    ) as any;
    expect(appRecord).toBeDefined();
    expect(appRecord.status).toBe('sms_sent');
    opportunityAppId = appRecord.id;

    // Verify outbound SMS record in DB
    const smsRecord = db.prepare('SELECT * FROM sms_messages WHERE job_id = ? AND worker_id = ? AND direction = ?').get(
      createdJob.id,
      selectedFreelancer.id,
      'outgoing'
    ) as any;
    expect(smsRecord).toBeDefined();
    expect(smsRecord.step).toBe('opportunity');
    expect(smsRecord.content).toContain('Wage: ₹800/day');
  });

  // 6. Worker Replies "1" -> DETAILS_SENT
  it('SMS: Worker replies "1" to request details -> State transitions to details_sent & DETAILS SMS is logged', () => {
    const reply1Result = smsService.processWorkerReply(
      createdJob.id,
      selectedFreelancer.id,
      '1'
    );

    expect(reply1Result.success).toBe(true);
    expect(reply1Result.newState).toBe('details_sent');

    // Verify DB state
    const appRecord = db.prepare('SELECT status FROM job_applications WHERE id = ?').get(opportunityAppId) as any;
    expect(appRecord.status).toBe('details_sent');

    // Verify details outbound SMS
    const detailsSms = db.prepare(
      'SELECT * FROM sms_messages WHERE job_id = ? AND worker_id = ? AND step = ?'
    ).get(createdJob.id, selectedFreelancer.id, 'details') as any;
    expect(detailsSms).toBeDefined();
    expect(detailsSms.content).toContain('1 to accept');
  });

  // 7. Worker Replies "1" -> ACCEPTED
  it('SMS: Worker replies "1" to accept -> State transitions to ACCEPTED', () => {
    const reply2Result = smsService.processWorkerReply(
      createdJob.id,
      selectedFreelancer.id,
      '1'
    );

    expect(reply2Result.success).toBe(true);
    expect(reply2Result.newState).toBe('accepted');

    // Verify DB state
    const appRecord = db.prepare('SELECT status FROM job_applications WHERE id = ?').get(opportunityAppId) as any;
    expect(appRecord.status).toBe('accepted');

    // Verify Acceptance confirmation SMS
    const acceptSms = db.prepare(
      'SELECT * FROM sms_messages WHERE job_id = ? AND worker_id = ? AND step = ?'
    ).get(createdJob.id, selectedFreelancer.id, 'accepted') as any;
    expect(acceptSms).toBeDefined();
  });

  // 8. Customer Assigns Worker -> ASSIGNMENT
  it('ASSIGNMENT: Customer assigns accepted worker -> atomic transaction creates assignment and updates job', () => {
    const assignedJob = jobService.assignWorker(createdJob.id, customerUser.id, selectedFreelancer.id);
    expect(assignedJob.status).toBe('assigned');

    // Verify assignment row in DB
    const assignmentRow = db.prepare('SELECT * FROM assignments WHERE job_id = ? AND freelancer_id = ?').get(
      createdJob.id,
      selectedFreelancer.id
    ) as any;
    expect(assignmentRow).toBeDefined();
    expect(assignmentRow.status).toBe('assigned');
    expect(assignmentRow.assigned_at).toBeDefined();

    // Verify job application updated to assigned
    const appRow = db.prepare('SELECT status FROM job_applications WHERE id = ?').get(opportunityAppId) as any;
    expect(appRow.status).toBe('assigned');
  });

  // 9. Completion & Work History Persistence
  it('COMPLETION: Job is marked complete -> history record persisted in DB', () => {
    const completedJob = jobService.completeJob(createdJob.id, customerUser.id);
    expect(completedJob.status).toBe('completed');

    // Verify assignment row completed
    const assignmentRow = db.prepare('SELECT * FROM assignments WHERE job_id = ?').get(createdJob.id) as any;
    expect(assignmentRow.status).toBe('completed');
    expect(assignmentRow.completed_at).toBeDefined();

    // Verify work history ledger row
    const historyRow = db.prepare('SELECT * FROM work_history WHERE job_id = ? AND worker_id = ?').get(
      createdJob.id,
      selectedFreelancer.id
    ) as any;
    expect(historyRow).toBeDefined();
    expect(historyRow.job_title).toBe('House Painting');
    expect(historyRow.payment_amount).toBe(800 * 5); // ₹4,000

    // Verify freelancer history API query returns this completed job
    const fHistory = freelancerService.getFreelancerHistory(selectedFreelancer.id);
    const foundHistory = fHistory.find(h => h.jobId === createdJob.id);
    expect(foundHistory).toBeDefined();
    expect(foundHistory?.jobTitle).toBe('House Painting');
  });
});
