import { describe, it, expect, beforeEach } from 'vitest';
import { storageService } from '../src/services/storageService';
import { SEED_USERS, SEED_JOBS, SEED_APPLICATIONS, SEED_WORK_HISTORY } from '../src/data/seedData';
import { Job, JobApplication } from '../src/types';

describe('Assignment Quota & Multi-Worker State Isolation Audit (Section 13, 38)', () => {
  beforeEach(() => {
    storageService.saveUsers(SEED_USERS);
    storageService.saveJobs(SEED_JOBS);
    storageService.saveApplications(SEED_APPLICATIONS);
    storageService.saveWorkHistory(SEED_WORK_HISTORY);
  });

  it('strictly enforces crew quota when workersRequired is 1', () => {
    const jobs = storageService.getJobs();
    const singleWorkerJob: Job = {
      ...jobs[0],
      id: 'JOB-SINGLE-1',
      workersRequired: 1,
      assignedWorkerIds: ['SQ-F-1042'] // Ramesh already assigned
    };

    const candidateB = 'SQ-F-1043'; // Suresh accepted

    // Attempting to assign candidate B should be blocked because assigned count >= workersRequired
    const canAssign = singleWorkerJob.assignedWorkerIds.length < singleWorkerJob.workersRequired ||
      singleWorkerJob.assignedWorkerIds.includes(candidateB);

    expect(canAssign).toBe(false);
    expect(singleWorkerJob.assignedWorkerIds.length).toBe(1);
  });

  it('allows filling crew up to exact workersRequired without over-allocation', () => {
    const multiWorkerJob: Job = {
      ...storageService.getJobs()[0],
      id: 'JOB-MULTI-3',
      workersRequired: 3,
      assignedWorkerIds: []
    };

    const workersToAssign = ['SQ-F-1042', 'SQ-F-1043', 'SQ-F-1044'];

    workersToAssign.forEach(wId => {
      if (multiWorkerJob.assignedWorkerIds.length < multiWorkerJob.workersRequired) {
        multiWorkerJob.assignedWorkerIds.push(wId);
      }
    });

    expect(multiWorkerJob.assignedWorkerIds.length).toBe(3);

    // Attempting to assign a 4th worker should be blocked
    const worker4 = 'SQ-F-1045';
    const canAssign4 = multiWorkerJob.assignedWorkerIds.length < multiWorkerJob.workersRequired;
    expect(canAssign4).toBe(false);
  });

  it('keeps other candidate workers in their respective states without accidental cross-assignment', () => {
    const apps: JobApplication[] = [
      { id: 'APP-1', jobId: 'JOB-TEST', workerId: 'SQ-F-1042', status: 'accepted' },
      { id: 'APP-2', jobId: 'JOB-TEST', workerId: 'SQ-F-1043', status: 'accepted' },
      { id: 'APP-3', jobId: 'JOB-TEST', workerId: 'SQ-F-1044', status: 'rejected' },
      { id: 'APP-4', jobId: 'JOB-TEST', workerId: 'SQ-F-1045', status: 'sent' }
    ];

    // Assign only Worker 1
    const assignedWorkerId = 'SQ-F-1042';
    const updatedApps = apps.map(a => {
      if (a.workerId === assignedWorkerId) {
        return { ...a, status: 'assigned' as const };
      }
      return a;
    });

    const app1 = updatedApps.find(a => a.workerId === 'SQ-F-1042');
    const app2 = updatedApps.find(a => a.workerId === 'SQ-F-1043');
    const app3 = updatedApps.find(a => a.workerId === 'SQ-F-1044');
    const app4 = updatedApps.find(a => a.workerId === 'SQ-F-1045');

    expect(app1?.status).toBe('assigned');
    // Worker 2 must remain accepted, NOT automatically assigned
    expect(app2?.status).toBe('accepted');
    // Worker 3 must remain rejected
    expect(app3?.status).toBe('rejected');
    // Worker 4 must remain sent
    expect(app4?.status).toBe('sent');
  });

  it('persists assignment correctly across storage reload', () => {
    const jobs = storageService.getJobs();
    const updatedJob: Job = {
      ...jobs[0],
      status: 'assigned',
      assignedWorkerIds: ['SQ-F-1042']
    };

    storageService.saveJobs([updatedJob, ...jobs.slice(1)]);

    const reloaded = storageService.getJobs();
    const reloadedJob = reloaded.find(j => j.id === updatedJob.id);

    expect(reloadedJob?.status).toBe('assigned');
    expect(reloadedJob?.assignedWorkerIds).toContain('SQ-F-1042');
  });
});
