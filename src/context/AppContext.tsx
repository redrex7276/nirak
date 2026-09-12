import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Job, 
  JobApplication, 
  SMSMessage, 
  WorkHistoryItem, 
  LanguageCode, 
  ToastMessage, 
  WorkerAvailability 
} from '../types';
import { storageService } from '../services/storageService';
import { smsService, evaluateSMSStateTransition } from '../services/smsService';
import { firebaseService } from '../services/firebaseService';
import { useAuth } from './AuthContext';

interface CreateJobParams {
  title: string;
  category: any;
  description: string;
  location: string;
  startDate: string;
  durationDays: number;
  reportingTime: string;
  workersRequired: number;
  skills: string[];
  experienceRequired: number;
  preferredLanguage: LanguageCode;
  paymentType: 'daily' | 'fixed';
  paymentAmount: number;
}

interface AppContextType {
  jobs: Job[];
  applications: JobApplication[];
  smsMessages: SMSMessage[];
  workHistory: WorkHistoryItem[];
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  toasts: ToastMessage[];
  addToast: (title: string, description?: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
  isSMSPanelOpen: boolean;
  setIsSMSPanelOpen: (open: boolean) => void;
  toggleSMSPanel: () => void;
  selectedWorkerForDemo: string;
  setSelectedWorkerForDemo: (workerId: string) => void;

  createJob: (params: CreateJobParams) => Promise<Job>;
  sendOpportunities: (jobId: string, workerIds: string[]) => Promise<void>;
  simulateWorkerReply: (jobId: string, workerId: string, reply: string) => Promise<void>;
  assignWorker: (jobId: string, workerId: string) => Promise<void>;
  completeJob: (jobId: string) => Promise<void>;
  updateWorkerAvailability: (workerId: string, availability: WorkerAvailability) => void;
  resetDemoData: () => void;
  getJobApplications: (jobId: string) => JobApplication[];
  getWorkerApplications: (workerId: string) => JobApplication[];
  getWorkerHistory: (workerId: string) => WorkHistoryItem[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { users, currentUser, updateFreelancerProfile, updateAnyWorkerProfile } = useAuth();

  const [jobs, setJobs] = useState<Job[]>(() => storageService.getJobs());
  const [applications, setApplications] = useState<JobApplication[]>(() => storageService.getApplications());
  const [smsMessages, setSmsMessages] = useState<SMSMessage[]>(() => storageService.getSMSMessages());
  const [workHistory, setWorkHistory] = useState<WorkHistoryItem[]>(() => storageService.getWorkHistory());
  const [language, setLanguageState] = useState<LanguageCode>(() => storageService.getLanguage());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isSMSPanelOpen, setIsSMSPanelOpen] = useState(false);
  const [selectedWorkerForDemo, setSelectedWorkerForDemo] = useState<string>('SQ-F-1042'); // Defaults to Ramesh Naik

  useEffect(() => {
    storageService.saveJobs(jobs);
  }, [jobs]);

  useEffect(() => {
    storageService.saveApplications(applications);
  }, [applications]);

  useEffect(() => {
    storageService.saveSMSMessages(smsMessages);
  }, [smsMessages]);

  useEffect(() => {
    storageService.saveWorkHistory(workHistory);
  }, [workHistory]);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    storageService.setLanguage(lang);
  };

  const addToast = (title: string, description?: string, type: ToastMessage['type'] = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastMessage = { id, title, description, type };
    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const toggleSMSPanel = () => setIsSMSPanelOpen(prev => !prev);

  const createJob = async (params: CreateJobParams): Promise<Job> => {
    const title = (params.title || '').trim();
    if (title.length < 3) {
      throw new Error('Job title must be at least 3 characters long.');
    }
    const location = (params.location || '').trim();
    if (!location) {
      throw new Error('Work location is required.');
    }
    const workersRequired = Math.max(1, Math.min(1000, Math.floor(Number(params.workersRequired) || 1)));
    const durationDays = Math.max(1, Math.min(365, Math.floor(Number(params.durationDays) || 1)));
    const paymentAmount = Math.max(1, Number(params.paymentAmount) || 100);
    const experienceRequired = Math.max(0, Math.min(50, Math.floor(Number(params.experienceRequired) || 0)));

    const newId = `SQ-J-${Math.floor(3000 + Math.random() * 1000)}`;
    const newJob: Job = {
      id: newId,
      customerId: currentUser?.id || 'SQ-C-201',
      customerName: currentUser?.name || 'Rajesh Sharma',
      title,
      category: params.category,
      description: (params.description || '').trim(),
      location,
      startDate: (params.startDate || '').trim() || 'Immediate',
      durationDays,
      reportingTime: (params.reportingTime || '').trim() || '8:00 AM',
      workersRequired,
      skills: params.skills || [],
      experienceRequired,
      preferredLanguage: params.preferredLanguage || 'mr',
      paymentType: params.paymentType || 'daily',
      paymentAmount,
      status: 'open',
      shortlistedWorkerIds: [],
      notifiedWorkerIds: [],
      interestedWorkerIds: [],
      assignedWorkerIds: [],
      completedWorkerIds: [],
      createdAt: new Date().toISOString()
    };

    const updated = [newJob, ...jobs];
    setJobs(updated);
    firebaseService.syncJob(newJob);
    addToast('Work Created Successfully', `Created "${newJob.title}" in ${newJob.location}`, 'success');
    return newJob;
  };

  const sendOpportunities = async (jobId: string, workerIds: string[]): Promise<void> => {
    const targetJob = jobs.find(j => j.id === jobId);
    if (!targetJob) return;

    const newApps: JobApplication[] = [];
    const newSMSList: SMSMessage[] = [];

    for (const workerId of workerIds) {
      const workerUser = users.find(u => u.id === workerId || u.freelancerProfile?.freelancerId === workerId);
      const workerProfile = workerUser?.freelancerProfile;
      const workerName = workerUser?.name || 'Worker';
      const workerPhone = workerUser?.mobile || '+91 98000 00000';
      const lang = workerProfile?.preferredLanguage || targetJob.preferredLanguage || 'en';

      // Check if application already exists
      const existing = applications.find(a => a.jobId === jobId && a.workerId === workerId);
      if (!existing) {
        newApps.push({
          id: `APP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          jobId,
          workerId,
          status: 'sent',
          sentAt: new Date().toISOString()
        });
      }

      // Generate localized opportunity SMS
      const smsText = smsService.generateOpportunitySMS(
        {
          title: targetJob.title,
          location: targetJob.location,
          date: targetJob.startDate,
          duration: targetJob.durationDays,
          rate: targetJob.paymentAmount,
          workers: targetJob.workersRequired
        },
        lang
      );

      const sms = await smsService.sendSMS({
        jobId,
        workerId,
        workerPhone,
        workerName,
        content: smsText,
        step: 'opportunity',
        language: lang
      });

      newSMSList.push(sms);
    }

    // Update applications and SMS history
    setApplications(prev => {
      const existingFiltered = prev.filter(a => !(a.jobId === jobId && workerIds.includes(a.workerId)));
      return [...newApps, ...existingFiltered];
    });

    setSmsMessages(prev => [...newSMSList, ...prev]);

    // Sync to Firebase backend in background
    newApps.forEach(a => firebaseService.syncApplication(a));
    newSMSList.forEach(m => firebaseService.syncSMSMessage(m));

    // Update job state
    setJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        const unionNotified = Array.from(new Set([...j.notifiedWorkerIds, ...workerIds]));
        const updated = {
          ...j,
          status: 'sms_sent' as const,
          notifiedWorkerIds: unionNotified
        };
        firebaseService.syncJob(updated);
        return updated;
      }
      return j;
    }));

    addToast(
      `${workerIds.length} Opportunities Dispatched`,
      `SMS sent to ${workerIds.length} freelancers in their preferred language.`,
      'success'
    );

    // Open SMS activity panel so user sees the messages
    setIsSMSPanelOpen(true);
  };

  const simulateWorkerReply = async (jobId: string, workerId: string, reply: string): Promise<void> => {
    const targetJob = jobs.find(j => j.id === jobId);
    const workerUser = users.find(u => u.id === workerId || u.freelancerProfile?.freelancerId === workerId);
    const workerName = workerUser?.name || 'Worker';
    const workerPhone = workerUser?.mobile || '+91 98000 00000';
    const workerLang = workerUser?.freelancerProfile?.preferredLanguage || 'en';

    const currentApp = applications.find(a => a.jobId === jobId && a.workerId === workerId);
    if (!currentApp) {
      addToast('No Active Opportunity', 'Worker has not been sent an opportunity for this job.', 'warning');
      return;
    }

    // Parse the command strictly using smsService
    const parsed = smsService.parseSMSResponse(reply);

    // 1. Log incoming SMS
    const incomingSMS: SMSMessage = {
      id: `SMS-IN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      jobId,
      workerId,
      workerPhone,
      workerName,
      direction: 'incoming',
      content: reply,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      status: 'delivered',
      step: currentApp.status === 'sent' ? 'details' : 'acceptance'
    };

    // 2. Evaluate State Machine
    const transition = evaluateSMSStateTransition(currentApp.status, parsed.command);

    if (!transition.nextStatus) {
      // Return safe guidance response to worker without corrupting state
      const invalidGuideSMS = smsService.generateInvalidReplySMS(workerLang);
      const outgoingGuide: SMSMessage = {
        id: `SMS-OUT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        jobId,
        workerId,
        workerPhone,
        workerName,
        direction: 'outgoing',
        content: invalidGuideSMS,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        status: 'delivered',
        step: 'info'
      };

      setSmsMessages(prev => [outgoingGuide, incomingSMS, ...prev]);
      addToast('Safe Guidance Sent', `Worker replied "${reply}". System preserved job state and sent SMS help prompt.`, 'warning');
      return;
    }

    const nextStatus = transition.nextStatus;
    const now = new Date().toISOString();

    // 3. Update application state
    setApplications(prev => prev.map(a => {
      if (a.id === currentApp.id) {
        return {
          ...a,
          status: nextStatus,
          respondedAt: now,
          viewedAt: nextStatus === 'details_requested' ? now : a.viewedAt
        };
      }
      return a;
    }));

    // 4. Update job interested/assigned IDs
    setJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        let interested = [...j.interestedWorkerIds];
        if (nextStatus === 'accepted' && !interested.includes(workerId)) {
          interested.push(workerId);
        } else if (nextStatus === 'rejected') {
          interested = interested.filter(id => id !== workerId);
        }
        return {
          ...j,
          status: interested.length > 0 ? 'responses_received' : j.status,
          interestedWorkerIds: interested
        };
      }
      return j;
    }));

    // 5. Generate automated system reply SMS
    let replyContent = '';
    const templateParams = {
      title: targetJob?.title || 'Painting Project',
      location: targetJob?.location || 'Mapusa',
      date: targetJob?.startDate || '18 Sept',
      duration: targetJob?.durationDays || 5,
      rate: targetJob?.paymentAmount || 800,
      workers: targetJob?.workersRequired || 10,
      time: targetJob?.reportingTime || '8:00 AM'
    };

    if (nextStatus === 'details_requested') {
      replyContent = smsService.generateDetailsSMS(templateParams, workerLang);
    } else if (nextStatus === 'accepted') {
      replyContent = smsService.generateAcceptedSMS(templateParams, workerLang);
    } else if (nextStatus === 'rejected') {
      replyContent = smsService.generateRejectedSMS(templateParams, workerLang);
    }

    const outgoingReply: SMSMessage = {
      id: `SMS-OUT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      jobId,
      workerId,
      workerPhone,
      workerName,
      direction: 'outgoing',
      content: replyContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      status: 'delivered',
      step: transition.outgoingStep || 'info'
    };

    setSmsMessages(prev => [outgoingReply, incomingSMS, ...prev]);

    // Sync SMS logs to Firebase backend
    firebaseService.syncSMSMessage(incomingSMS);
    firebaseService.syncSMSMessage(outgoingReply);

    if (nextStatus === 'details_requested') {
      addToast(`${workerName} Requested Full Details`, 'System delivered job terms over SMS.', 'info');
    } else if (nextStatus === 'accepted') {
      addToast(`✓ ${workerName} Accepted Work!`, 'Status updated to ACCEPTED on Customer Dashboard.', 'success');
    } else if (nextStatus === 'rejected') {
      addToast(`${workerName} Declined Opportunity`, 'Status updated to REJECTED.', 'warning');
    }
  };

  const assignWorker = async (jobId: string, workerId: string): Promise<void> => {
    const targetJob = jobs.find(j => j.id === jobId);
    if (!targetJob) return;

    // Strict quota enforcement: prevent exceeding workersRequired
    if (
      targetJob.assignedWorkerIds.length >= targetJob.workersRequired &&
      !targetJob.assignedWorkerIds.includes(workerId)
    ) {
      addToast(
        'Crew Quota Met',
        `This job requires ${targetJob.workersRequired} worker(s). All positions have already been assigned.`,
        'warning'
      );
      return;
    }

    const workerUser = users.find(u => u.id === workerId || u.freelancerProfile?.freelancerId === workerId);
    const workerName = workerUser?.name || 'Worker';
    const workerPhone = workerUser?.mobile || '+91 98000 00000';
    const workerLang = workerUser?.freelancerProfile?.preferredLanguage || 'en';

    // Update application to assigned
    setApplications(prev => prev.map(a => {
      if (a.jobId === jobId && a.workerId === workerId) {
        return {
          ...a,
          status: 'assigned',
          assignedAt: new Date().toISOString()
        };
      }
      return a;
    }));

    // Update job assignedWorkerIds
    setJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        const assigned = Array.from(new Set([...j.assignedWorkerIds, workerId]));
        const updated = {
          ...j,
          status: 'assigned' as const,
          assignedWorkerIds: assigned
        };
        firebaseService.syncJob(updated);
        return updated;
      }
      return j;
    }));

    // Send assignment confirmation SMS
    const templateParams = {
      title: targetJob?.title || 'Painting Project',
      location: targetJob?.location || 'Mapusa',
      date: targetJob?.startDate || '18 Sept',
      duration: targetJob?.durationDays || 5,
      rate: targetJob?.paymentAmount || 800,
      time: targetJob?.reportingTime || '8:00 AM'
    };

    const smsText = smsService.generateAssignedSMS(templateParams, workerLang);

    const sms = await smsService.sendSMS({
      jobId,
      workerId,
      workerPhone,
      workerName,
      content: smsText,
      step: 'assignment',
      language: workerLang
    });

    setSmsMessages(prev => [sms, ...prev]);
    firebaseService.syncSMSMessage(sms);

    addToast(
      `Worker Assigned: ${workerName}`,
      `Reporting confirmation SMS dispatched to ${workerPhone}.`,
      'success'
    );
  };

  const completeJob = async (jobId: string): Promise<void> => {
    const targetJob = jobs.find(j => j.id === jobId);
    if (!targetJob) return;

    const assignedIds = targetJob.assignedWorkerIds.length > 0
      ? targetJob.assignedWorkerIds
      : applications.filter(a => a.jobId === jobId && (a.status === 'assigned' || a.status === 'accepted')).map(a => a.workerId);

    if (assignedIds.length === 0) {
      addToast('No Assigned Workers', 'Assign at least one worker before marking complete.', 'warning');
      return;
    }

    const now = new Date().toISOString();
    const newHistoryItems: WorkHistoryItem[] = [];

    // Update each assigned worker's history and jobsCompleted
    for (const workerId of assignedIds) {
      const workerUser = users.find(u => u.id === workerId || u.freelancerProfile?.freelancerId === workerId);
      const earned = (targetJob.paymentAmount || 800) * (targetJob.durationDays || 5);

      const historyItem: WorkHistoryItem = {
        id: `WH-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        workerId,
        jobId,
        jobTitle: targetJob.title,
        category: targetJob.category,
        location: targetJob.location,
        completedDate: '12 Sept 2026',
        durationDays: targetJob.durationDays,
        rating: 5,
        feedback: 'Excellent punctuality, clean execution, and high skill level.',
        earnedAmount: earned,
        customerName: targetJob.customerName
      };

      newHistoryItems.push(historyItem);

      // If this worker is in users list, update jobs completed
      if (workerUser?.freelancerProfile) {
        const newCount = (workerUser.freelancerProfile.jobsCompleted || 0) + 1;
        updateAnyWorkerProfile(workerId, {
          jobsCompleted: newCount,
          rating: 5.0
        });
      }
    }

    setWorkHistory(prev => [...newHistoryItems, ...prev]);

    // Sync work history to Firebase backend
    newHistoryItems.forEach(h => firebaseService.syncWorkHistory(h));

    // Update applications to completed
    setApplications(prev => prev.map(a => {
      if (a.jobId === jobId && assignedIds.includes(a.workerId)) {
        return {
          ...a,
          status: 'completed',
          completedAt: now
        };
      }
      return a;
    }));

    // Update job to completed
    setJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        const updated = {
          ...j,
          status: 'completed' as const,
          completedWorkerIds: assignedIds
        };
        firebaseService.syncJob(updated);
        return updated;
      }
      return j;
    }));

    addToast(
      'Work Marked Completed!',
      `Logged in official work history for ${assignedIds.length} worker(s). Rating: ★ 5.0`,
      'success'
    );
  };

  const updateWorkerAvailability = (workerId: string, availability: WorkerAvailability) => {
    updateFreelancerProfile({ availability });
    addToast('Availability Updated', `Status set to ${availability.toUpperCase()}`, 'info');
  };

  const resetDemoData = () => {
    storageService.resetToDefaults();
    setJobs(storageService.getJobs());
    setApplications([]);
    setSmsMessages([]);
    setWorkHistory(storageService.getWorkHistory());
    addToast('Demo State Reset', 'Restored pristine initial dataset.', 'info');
  };

  const getJobApplications = (jobId: string) => applications.filter(a => a.jobId === jobId);
  const getWorkerApplications = (workerId: string) => applications.filter(a => a.workerId === workerId);
  const getWorkerHistory = (workerId: string) => workHistory.filter(h => h.workerId === workerId);

  return (
    <AppContext.Provider
      value={{
        jobs,
        applications,
        smsMessages,
        workHistory,
        language,
        setLanguage,
        toasts,
        addToast,
        removeToast,
        isSMSPanelOpen,
        setIsSMSPanelOpen,
        toggleSMSPanel,
        selectedWorkerForDemo,
        setSelectedWorkerForDemo,
        createJob,
        sendOpportunities,
        simulateWorkerReply,
        assignWorker,
        completeJob,
        updateWorkerAvailability,
        resetDemoData,
        getJobApplications,
        getWorkerApplications,
        getWorkerHistory
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
