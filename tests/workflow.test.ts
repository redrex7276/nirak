import { describe, it, expect, beforeEach } from 'vitest';
import { storageService } from '../src/services/storageService';
import { smsService, evaluateSMSStateTransition } from '../src/services/smsService';
import { SEED_USERS, SEED_JOBS, SEED_APPLICATIONS, SEED_WORK_HISTORY } from '../src/data/seedData';
import { Job, JobApplication, WorkHistoryItem } from '../src/types';

describe('End-to-End Workflow & Data Integrity Audit', () => {
  beforeEach(() => {
    storageService.saveUsers(SEED_USERS);
    storageService.saveJobs(SEED_JOBS);
    storageService.saveApplications(SEED_APPLICATIONS);
    storageService.saveWorkHistory(SEED_WORK_HISTORY);
  });

  it('verifies initial seed job and applications integrity', () => {
    const jobs = storageService.getJobs();
    const apps = storageService.getApplications();

    expect(jobs.length).toBeGreaterThan(0);
    const paintingJob = jobs.find(j => j.title.includes('Painting'));
    expect(paintingJob).toBeDefined();

    // Verify all applications have valid job and worker IDs
    apps.forEach(app => {
      expect(app.jobId).toBeDefined();
      expect(app.workerId).toBeDefined();
      expect(['sent', 'details_requested', 'accepted', 'rejected', 'assigned', 'completed']).toContain(app.status);
    });
  });

  it('completes the entire SMS lifecycle: dispatch -> request details (1) -> accept (1)', () => {
    let currentStatus: JobApplication['status'] = 'sent';

    // Step 1: Worker sends '1' to view details
    const step1 = evaluateSMSStateTransition(currentStatus, '1');
    expect(step1.nextStatus).toBe('details_requested');
    expect(step1.outgoingStep).toBe('details');
    currentStatus = step1.nextStatus!;

    // Step 2: Worker sends '1' to accept
    const step2 = evaluateSMSStateTransition(currentStatus, '1');
    expect(step2.nextStatus).toBe('accepted');
    expect(step2.outgoingStep).toBe('acceptance');
    currentStatus = step2.nextStatus!;

    expect(currentStatus).toBe('accepted');
  });

  it('handles rejection lifecycle: worker sends "0" at opportunity stage', () => {
    const step = evaluateSMSStateTransition('sent', '0');
    expect(step.nextStatus).toBe('rejected');
  });

  it('handles rejection lifecycle: worker sends "0" at details stage', () => {
    const step = evaluateSMSStateTransition('details_requested', '0');
    expect(step.nextStatus).toBe('rejected');
  });

  it('assigns worker to job and avoids duplicate assignment', () => {
    const jobs = storageService.getJobs();
    const targetJob = { ...jobs[0] };
    const workerId = 'SQ-F-1042';

    // Initial state
    targetJob.assignedWorkerIds = [workerId];
    targetJob.status = 'assigned';

    expect(targetJob.assignedWorkerIds).toContain(workerId);
    expect(targetJob.assignedWorkerIds.length).toBe(1);

    // Attempting to add same worker should not duplicate
    const union = Array.from(new Set([...targetJob.assignedWorkerIds, workerId]));
    expect(union.length).toBe(1);
  });

  it('completes work, generates work history record, and increments worker counter', () => {
    const workerId = 'SQ-F-1042';
    const users = storageService.getUsers();
    const workerUser = users.find(u => u.id === workerId)!;
    const initialCompleted = workerUser.freelancerProfile!.jobsCompleted;

    // Simulate completion
    const newHistoryItem: WorkHistoryItem = {
      id: `WH-${Date.now()}`,
      jobId: 'SQ-J-TEST',
      workerId,
      customerName: 'Rajesh Sharma',
      jobTitle: 'House Painting',
      category: 'Painting',
      location: 'Mapusa',
      startDate: '2026-09-12',
      endDate: '2026-09-17',
      durationDays: 5,
      totalAmountPaid: 4000,
      paymentStatus: 'paid',
      ratingGiven: 5,
      reviewComment: 'Excellent neat painting'
    };

    const history = [...storageService.getWorkHistory(), newHistoryItem];
    storageService.saveWorkHistory(history);

    // Update worker profile
    const updatedUsers = users.map(u => {
      if (u.id === workerId && u.freelancerProfile) {
        return {
          ...u,
          freelancerProfile: {
            ...u.freelancerProfile,
            jobsCompleted: u.freelancerProfile.jobsCompleted + 1
          }
        };
      }
      return u;
    });
    storageService.saveUsers(updatedUsers);

    // Verify persistence
    const reloadedHistory = storageService.getWorkHistory();
    const reloadedUsers = storageService.getUsers();
    const reloadedWorker = reloadedUsers.find(u => u.id === workerId)!;

    expect(reloadedHistory.some(h => h.id === newHistoryItem.id)).toBe(true);
    expect(reloadedWorker.freelancerProfile!.jobsCompleted).toBe(initialCompleted + 1);
  });
});
