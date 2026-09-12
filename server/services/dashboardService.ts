import db from '../db/database';

export class DashboardService {
  /**
   * Calculate live customer dashboard metrics directly from persistent database
   */
  getCustomerStats(customerId: string) {
    const totalJobsRow = db.prepare('SELECT count(*) as count FROM jobs WHERE customer_id = ?').get(customerId) as any;
    const activeJobsRow = db.prepare(`
      SELECT count(*) as count FROM jobs 
      WHERE customer_id = ? AND status IN ('open', 'sms_sent', 'responses_received', 'assigned', 'in_progress')
    `).get(customerId) as any;

    const completedJobsRow = db.prepare(`
      SELECT count(*) as count FROM jobs 
      WHERE customer_id = ? AND status = 'completed'
    `).get(customerId) as any;

    const appsRow = db.prepare(`
      SELECT 
        count(*) as totalWorkersSelected,
        sum(CASE WHEN ja.status IN ('accepted', 'assigned') THEN 1 ELSE 0 END) as responsesReceived
      FROM job_applications ja
      JOIN jobs j ON j.id = ja.job_id
      WHERE j.customer_id = ?
    `).get(customerId) as any;

    const spendRow = db.prepare(`
      SELECT sum(payment_amount) as totalSpent 
      FROM work_history 
      WHERE customer_id = ?
    `).get(customerId) as any;

    return {
      totalJobs: totalJobsRow?.count || 0,
      activeJobs: activeJobsRow?.count || 0,
      completedJobs: completedJobsRow?.count || 0,
      workersSelected: appsRow?.totalWorkersSelected || 0,
      responsesReceived: appsRow?.responsesReceived || 0,
      totalSpent: spendRow?.totalSpent || 0
    };
  }

  /**
   * Calculate live freelancer dashboard metrics directly from persistent database
   */
  getFreelancerStats(workerId: string) {
    const fl = db.prepare(`
      SELECT * FROM freelancers 
      WHERE freelancer_id = ? OR user_id = ?
    `).get(workerId, workerId) as any;

    const oppRow = db.prepare(`
      SELECT 
        sum(CASE WHEN status IN ('sms_sent', 'waiting_for_details_request') THEN 1 ELSE 0 END) as availableOpportunities,
        sum(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) as acceptedJobs,
        sum(CASE WHEN status = 'assigned' THEN 1 ELSE 0 END) as assignedJobs
      FROM job_applications 
      WHERE worker_id = ? OR worker_id = ?
    `).get(fl?.freelancer_id || workerId, workerId) as any;

    const earningsRow = db.prepare(`
      SELECT sum(payment_amount) as totalEarnings 
      FROM work_history 
      WHERE worker_id = ? OR worker_id = ?
    `).get(fl?.freelancer_id || workerId, workerId) as any;

    return {
      availableOpportunities: oppRow?.availableOpportunities || 0,
      acceptedJobs: oppRow?.acceptedJobs || 0,
      assignedJobs: oppRow?.assignedJobs || 0,
      completedJobs: fl?.completed_jobs || 0,
      totalEarnings: earningsRow?.totalEarnings || 0,
      rating: fl?.rating || 4.5
    };
  }
}

export const dashboardService = new DashboardService();
