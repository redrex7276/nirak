import db from '../db/database';

export interface CreateJobInput {
  title: string;
  category: string;
  description: string;
  location: string;
  startDate: string;
  durationDays: number;
  reportingTime?: string;
  workersRequired: number;
  skills: string[];
  experienceRequired?: number;
  preferredLanguage?: string;
  paymentType?: 'daily' | 'fixed';
  paymentAmount: number;
}

export interface JobQueryFilters {
  search?: string;
  category?: string;
  location?: string;
  status?: string;
  customerId?: string;
  sort?: 'newest' | 'oldest' | 'rate_asc' | 'rate_desc' | 'status';
  page?: number;
  limit?: number;
}

export class JobService {
  /**
   * Helper to format raw database job row into JSON DTO
   */
  private formatJob(row: any) {
    let assignedWorkerIds: string[] = [];
    let skills: string[] = [];

    try {
      assignedWorkerIds = JSON.parse(row.assigned_worker_ids || '[]');
    } catch {
      assignedWorkerIds = [];
    }

    try {
      skills = JSON.parse(row.skills_json || '[]');
    } catch {
      skills = [];
    }

    return {
      id: row.id,
      customerId: row.customer_id,
      customerName: row.customer_name,
      customerPhone: row.customer_phone,
      title: row.title,
      category: row.category,
      description: row.description,
      location: row.location,
      startDate: row.start_date,
      durationDays: row.duration_days,
      reportingTime: row.reporting_time,
      workersRequired: row.workers_required,
      skills,
      experienceRequired: row.experience_required,
      preferredLanguage: row.preferred_language,
      paymentType: row.payment_type,
      paymentAmount: row.payment_amount,
      status: row.status,
      assignedWorkerIds,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  /**
   * Create a new work opportunity
   */
  createJob(customerId: string, input: CreateJobInput) {
    const customer = db.prepare('SELECT * FROM users WHERE id = ?').get(customerId) as any;
    if (!customer) {
      throw new Error('Customer account not found.');
    }
    if (customer.role !== 'customer') {
      throw new Error('Only registered customers can create work opportunities.');
    }

    // Input Validation
    if (!input.title?.trim()) throw new Error('Job title is required.');
    if (!input.category?.trim()) throw new Error('Trade category is required.');
    if (!input.description?.trim()) throw new Error('Job description is required.');
    if (!input.location?.trim()) throw new Error('Location is required.');
    if (!input.paymentAmount || input.paymentAmount <= 0) throw new Error('Valid wage amount is required.');
    if (!input.workersRequired || input.workersRequired <= 0) throw new Error('At least 1 worker is required.');

    const jobId = `job-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    db.prepare(`
      INSERT INTO jobs (
        id, customer_id, customer_name, customer_phone, title, category, description,
        location, start_date, duration_days, reporting_time, workers_required,
        payment_type, payment_amount, status, experience_required, preferred_language,
        assigned_worker_ids, skills_json, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, 'open', ?, ?,
        '[]', ?, datetime('now'), datetime('now')
      )
    `).run(
      jobId,
      customerId,
      customer.name,
      customer.phone,
      input.title.trim(),
      input.category.trim(),
      input.description.trim(),
      input.location.trim(),
      input.startDate || new Date().toISOString().split('T')[0],
      input.durationDays || 1,
      input.reportingTime || '08:00 AM',
      input.workersRequired || 1,
      input.paymentType || 'daily',
      input.paymentAmount,
      input.experienceRequired || 0,
      input.preferredLanguage || 'en',
      JSON.stringify(input.skills || [])
    );

    return this.getJobById(jobId);
  }

  /**
   * Query and search jobs with database-level filtering, pagination, and sorting
   */
  getJobs(filters: JobQueryFilters = {}) {
    const conditions: string[] = [];
    const params: any[] = [];

    if (filters.customerId) {
      conditions.push('customer_id = ?');
      params.push(filters.customerId);
    }

    if (filters.category && filters.category !== 'all') {
      conditions.push('lower(category) = lower(?)');
      params.push(filters.category.trim());
    }

    if (filters.status && filters.status !== 'all') {
      conditions.push('status = ?');
      params.push(filters.status.trim().toLowerCase());
    }

    if (filters.location && filters.location !== 'all') {
      conditions.push('lower(location) LIKE lower(?)');
      params.push(`%${filters.location.trim()}%`);
    }

    if (filters.search?.trim()) {
      const term = `%${filters.search.trim()}%`;
      conditions.push(`(
        lower(title) LIKE lower(?) OR 
        lower(description) LIKE lower(?) OR 
        lower(category) LIKE lower(?) OR 
        lower(location) LIKE lower(?) OR 
        lower(skills_json) LIKE lower(?)
      )`);
      params.push(term, term, term, term, term);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Total Count
    const countRow = db.prepare(`SELECT count(*) as total FROM jobs ${whereClause}`).get(...params) as any;
    const total = countRow?.total || 0;

    // Sorting
    let orderClause = 'ORDER BY created_at DESC';
    if (filters.sort === 'oldest') orderClause = 'ORDER BY created_at ASC';
    if (filters.sort === 'rate_asc') orderClause = 'ORDER BY payment_amount ASC';
    if (filters.sort === 'rate_desc') orderClause = 'ORDER BY payment_amount DESC';
    if (filters.sort === 'status') orderClause = 'ORDER BY status ASC, created_at DESC';

    // Pagination
    const page = Math.max(1, filters.page || 1);
    const limit = Math.max(1, Math.min(100, filters.limit || 50));
    const offset = (page - 1) * limit;

    const rows = db.prepare(`
      SELECT * FROM jobs 
      ${whereClause} 
      ${orderClause} 
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset) as any[];

    return {
      jobs: rows.map(r => this.formatJob(r)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Retrieve single job by ID
   */
  getJobById(id: string) {
    const row = db.prepare('SELECT * FROM jobs WHERE id = ?').get(id) as any;
    if (!row) return null;
    return this.formatJob(row);
  }

  /**
   * Update job details
   */
  updateJob(id: string, customerId: string, updates: Partial<CreateJobInput>) {
    const job = this.getJobById(id);
    if (!job) throw new Error('Job not found.');
    if (job.customerId !== customerId) {
      throw new Error('Unauthorized: You can only modify your own work opportunities.');
    }

    const setClauses: string[] = [];
    const params: any[] = [];

    if (updates.title) { setClauses.push('title = ?'); params.push(updates.title.trim()); }
    if (updates.description) { setClauses.push('description = ?'); params.push(updates.description.trim()); }
    if (updates.location) { setClauses.push('location = ?'); params.push(updates.location.trim()); }
    if (updates.paymentAmount) { setClauses.push('payment_amount = ?'); params.push(updates.paymentAmount); }
    if (updates.durationDays) { setClauses.push('duration_days = ?'); params.push(updates.durationDays); }

    if (setClauses.length === 0) return job;

    setClauses.push("updated_at = datetime('now')");
    params.push(id);

    db.prepare(`UPDATE jobs SET ${setClauses.join(', ')} WHERE id = ?`).run(...params);
    return this.getJobById(id);
  }

  /**
   * Cancel job safely
   */
  cancelJob(id: string, customerId: string) {
    const job = this.getJobById(id);
    if (!job) throw new Error('Job not found.');
    if (job.customerId !== customerId) {
      throw new Error('Unauthorized: You can only cancel your own work opportunities.');
    }

    db.prepare("UPDATE jobs SET status = 'cancelled', updated_at = datetime('now') WHERE id = ?").run(id);
    return this.getJobById(id);
  }

  /**
   * Assign worker to job atomically
   */
  assignWorker(jobId: string, customerId: string, workerId: string) {
    const job = this.getJobById(jobId);
    if (!job) throw new Error('Job not found.');
    if (job.customerId !== customerId) {
      throw new Error('Unauthorized: Only the posting customer can assign workers.');
    }

    // Check application status
    const app = db.prepare('SELECT * FROM job_applications WHERE job_id = ? AND worker_id = ?').get(jobId, workerId) as any;
    if (!app || app.status !== 'accepted') {
      throw new Error('Cannot assign: Worker must reply 1 and accept the opportunity first.');
    }

    // Check quota
    const assignedIds: string[] = job.assignedWorkerIds || [];
    if (assignedIds.includes(workerId)) {
      throw new Error('This worker is already assigned to this job.');
    }
    if (assignedIds.length >= job.workersRequired) {
      throw new Error(`Assignment quota reached: This job only requires ${job.workersRequired} worker(s).`);
    }

    return db.transaction(() => {
      const newAssigned = [...assignedIds, workerId];
      const isFullyAssigned = newAssigned.length >= job.workersRequired;

      // Update job
      db.prepare(`
        UPDATE jobs 
        SET assigned_worker_ids = ?, status = ?, updated_at = datetime('now')
        WHERE id = ?
      `).run(JSON.stringify(newAssigned), isFullyAssigned ? 'assigned' : 'responses_received', jobId);

      // Update application
      db.prepare(`
        UPDATE job_applications
        SET status = 'assigned', assigned_at = datetime('now'), updated_at = datetime('now')
        WHERE job_id = ? AND worker_id = ?
      `).run(jobId, workerId);

      // Create assignment record
      const assignId = `assign-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      db.prepare(`
        INSERT OR REPLACE INTO assignments (
          id, job_id, freelancer_id, customer_id, status, assigned_at, created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, 'assigned', datetime('now'), datetime('now'), datetime('now')
        )
      `).run(assignId, jobId, workerId, customerId);

      // Send SMS confirmation event
      const smsId = `sms-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      db.prepare(`
        INSERT INTO sms_messages (
          id, job_id, worker_id, worker_name, worker_phone, direction, content, step, status, timestamp, created_at
        ) VALUES (
          ?, ?, ?, 'Worker', '+91 98200 00000', 'outgoing', ?, 'assigned', 'sent', datetime('now'), datetime('now')
        )
      `).run(
        smsId,
        jobId,
        workerId,
        `SHRAMIK ASSIGNMENT CONFIRMED: You are selected for "${job.title}". Reporting: ${job.startDate} at ${job.reportingTime}. Location: ${job.location}. Contact: ${job.customerName} (${job.customerPhone}).`
      );

      return this.getJobById(jobId);
    })();
  }

  /**
   * Complete work atomically and record in history
   */
  completeJob(jobId: string, customerId: string) {
    const job = this.getJobById(jobId);
    if (!job) throw new Error('Job not found.');
    if (job.customerId !== customerId) {
      throw new Error('Unauthorized: Only the posting customer can complete work.');
    }

    const assignedWorkers: string[] = job.assignedWorkerIds || [];
    if (assignedWorkers.length === 0) {
      throw new Error('Cannot complete a job with zero assigned workers.');
    }

    return db.transaction(() => {
      // 1. Mark job complete
      db.prepare("UPDATE jobs SET status = 'completed', updated_at = datetime('now') WHERE id = ?").run(jobId);

      // 2. Mark assignments complete
      db.prepare(`
        UPDATE assignments 
        SET status = 'completed', completed_at = datetime('now'), updated_at = datetime('now')
        WHERE job_id = ?
      `).run(jobId);

      // 3. Create work history entries & update freelancer ratings/counts
      for (const workerId of assignedWorkers) {
        const histId = `hist-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        db.prepare(`
          INSERT OR REPLACE INTO work_history (
            id, job_id, worker_id, customer_id, job_title, job_category, job_location,
            payment_amount, completed_at, rating, review, created_at
          ) VALUES (
            ?, ?, ?, ?, ?, ?, ?,
            ?, datetime('now'), 5.0, 'Work completed on schedule with verified client sign-off.', datetime('now')
          )
        `).run(
          histId,
          jobId,
          workerId,
          customerId,
          job.title,
          job.category,
          job.location,
          job.paymentAmount * job.durationDays
        );

        // Update freelancer profile stats
        db.prepare(`
          UPDATE freelancers 
          SET completed_jobs = completed_jobs + 1, updated_at = datetime('now')
          WHERE freelancer_id = ? OR user_id = ?
        `).run(workerId, workerId);

        // Send completion SMS log
        const smsId = `sms-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        db.prepare(`
          INSERT INTO sms_messages (
            id, job_id, worker_id, worker_name, worker_phone, direction, content, step, status, timestamp, created_at
          ) VALUES (
            ?, ?, ?, 'Worker', '+91 98200 00000', 'outgoing', ?, 'completed', 'sent', datetime('now'), datetime('now')
          )
        `).run(
          smsId,
          jobId,
          workerId,
          `SHRAMIK COMPLETION: "${job.title}" marked COMPLETED. Payment credited to your verified history ledger. Thank you!`
        );
      }

      return this.getJobById(jobId);
    })();
  }
}

export const jobService = new JobService();
