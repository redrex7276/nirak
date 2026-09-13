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
import { apiClient } from '../services/apiClient';
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
  selectedJobIdForDemo: string;
  setSelectedJobIdForDemo: (jobId: string) => void;

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
  const [selectedJobIdForDemo, setSelectedJobIdForDemo] = useState<string>('');

  // Rehydrate jobs, applications, SMS logs, and history from SQLite backend database on mount
  useEffect(() => {
    async function loadBackendData() {
      try {
        const { jobs: dbJobs } = await apiClient.getJobs();
        if (dbJobs && dbJobs.length > 0) {
          setJobs(dbJobs);
        }
        const dbSms = await apiClient.getSMSLogs();
        if (dbSms && dbSms.length > 0) {
          setSmsMessages(dbSms);
        }
        const dbApps = await apiClient.getApplications();
        if (dbApps && dbApps.length > 0) {
          setApplications(dbApps);
        }
      } catch (err) {
        console.warn('Backend database rehydration note:', err);
      }
    }
    loadBackendData();
  }, []);

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

    // 1. Persist directly to backend SQLite database
    try {
      const persistedJob = await apiClient.createJob({
        title,
        category: params.category,
        description: (params.description || '').trim(),
        location,
        startDate: (params.startDate || '').trim() || new Date().toISOString().split('T')[0],
        durationDays,
        reportingTime: (params.reportingTime || '').trim() || '08:00 AM',
        workersRequired,
        skills: params.skills || [],
        experienceRequired,
        preferredLanguage: params.preferredLanguage || 'mr',
        paymentType: params.paymentType || 'daily',
        paymentAmount
      });

      if (persistedJob) {
        setJobs(prev => [persistedJob, ...prev.filter(j => j.id !== persistedJob.id)]);
        firebaseService.syncJob(persistedJob);
        addToast('Work Created Successfully', `Created "${persistedJob.title}" in ${persistedJob.location}`, 'success');
        return persistedJob;
      }
    } catch (err: any) {
      console.warn('Backend job creation note, continuing with optimistic client sync:', err);
    }

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
    setSelectedJobIdForDemo(newJob.id);
    firebaseService.syncJob(newJob);
    addToast('Work Created Successfully', `Created "${newJob.title}" in ${newJob.location}`, 'success');
    return newJob;
  };

  const sendOpportunities = async (jobId: string, workerIds: string[]): Promise<void> => {
    setSelectedJobIdForDemo(jobId);
    if (workerIds.length > 0) {
      setSelectedWorkerForDemo(workerIds[0]);
    }

    // 1. Dispatch via backend SQLite database
    try {
      await apiClient.dispatchOpportunities(jobId, workerIds);
      const { jobs: freshJobs } = await apiClient.getJobs();
      if (freshJobs && freshJobs.length > 0) setJobs(freshJobs);
      const freshSms = await apiClient.getSMSLogs();
      if (freshSms) setSmsMessages(freshSms);
      const freshApps = await apiClient.getApplications();
      if (freshApps) setApplications(freshApps);
      setIsSMSPanelOpen(true);
      addToast(
        `${workerIds.length} Opportunities Dispatched`,
        `SMS sent to ${workerIds.length} freelancers in their preferred language.`,
        'success'
      );
      return;
    } catch (apiErr) {
      console.warn('Backend dispatch note, falling back:', apiErr);
    }

    const targetJob = jobs.find(j => j.id === jobId) || jobs[0];
    const actualJobId = targetJob?.id || jobId || 'SQ-J-3001';

    const newApps: JobApplication[] = [];
    const newSMSList: SMSMessage[] = [];

    for (const workerId of workerIds) {
      const workerUser = users.find(u => u.id === workerId || u.freelancerProfile?.freelancerId === workerId);
      const workerProfile = workerUser?.freelancerProfile;
      const workerName = workerUser?.name || 'Worker';
      const workerPhone = workerUser?.mobile || '+91 98000 00000';
      const lang = workerProfile?.preferredLanguage || targetJob?.preferredLanguage || 'mr';

      // Check if application already exists
      const existing = applications.find(a => (a.jobId === actualJobId || a.jobId === jobId) && a.workerId === workerId);
      if (!existing) {
        newApps.push({
          id: `APP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          jobId: actualJobId,
          workerId,
          status: 'sent',
          sentAt: new Date().toISOString()
        });
      }

      // Generate localized opportunity SMS
      const smsText = smsService.generateOpportunitySMS(
        {
          title: targetJob?.title || 'Painting Project - 4-Storey Exterior Weather Coating',
          location: targetJob?.location || 'Mapusa Industrial Area, Goa',
          date: targetJob?.startDate || '18 Sept 2026',
          duration: targetJob?.durationDays || 5,
          rate: targetJob?.paymentAmount || 800,
          workers: targetJob?.workersRequired || 10
        },
        lang
      );

      const sms = await smsService.sendSMS({
        jobId: actualJobId,
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
      const existingFiltered = prev.filter(a => !( (a.jobId === actualJobId || a.jobId === jobId) && workerIds.includes(a.workerId) ));
      return [...newApps, ...existingFiltered];
    });

    setSmsMessages(prev => [...newSMSList, ...prev]);

    // Sync to Firebase backend in background
    newApps.forEach(a => firebaseService.syncApplication(a));
    newSMSList.forEach(m => firebaseService.syncSMSMessage(m));

    // Update job state
    setJobs(prev => prev.map(j => {
      if (j.id === actualJobId || j.id === jobId) {
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

    setSelectedJobIdForDemo(actualJobId);
    if (workerIds.length > 0) {
      setSelectedWorkerForDemo(workerIds[0]);
    }

    addToast(
      `${workerIds.length} Opportunities Dispatched`,
      `SMS sent to ${workerIds.length} freelancers in their preferred language.`,
      'success'
    );

    // Open SMS activity panel so user sees the messages
    setIsSMSPanelOpen(true);
  };

  const simulateWorkerReply = async (jobId: string, workerId: string, reply: string): Promise<void> => {
    // 1. Process via backend SQLite database state machine
    try {
      const res = await apiClient.simulateWorkerReply(jobId, workerId, reply);
      if (res && res.success) {
        const { jobs: freshJobs } = await apiClient.getJobs();
        if (freshJobs && freshJobs.length > 0) setJobs(freshJobs);
        const freshSms = await apiClient.getSMSLogs();
        if (freshSms) setSmsMessages(freshSms);
        const freshApps = await apiClient.getApplications();
        if (freshApps) setApplications(freshApps);
        addToast(`SMS Reply Processed (${reply})`, `Worker state updated to ${res.newState.toUpperCase()}`, 'success');
        return;
      }
    } catch (apiErr) {
      console.warn('Backend simulate reply note, falling back:', apiErr);
    }

    const targetJob = jobs.find(j => j.id === jobId) || jobs[0];
    const actualJobId = targetJob?.id || jobId || 'SQ-J-3001';
    const workerUser = users.find(u => u.id === workerId || u.freelancerProfile?.freelancerId === workerId);
    const workerName = workerUser?.name || 'Worker';
    const workerPhone = workerUser?.mobile || '+91 98000 00000';
    const workerLang = workerUser?.freelancerProfile?.preferredLanguage || targetJob?.preferredLanguage || 'mr';

    let currentApp = applications.find(a => 
      (a.jobId === actualJobId || a.jobId === jobId) && 
      (a.workerId === workerId || (workerUser && (a.workerId === workerUser.id || a.workerId === workerUser.freelancerProfile?.freelancerId)))
    );

    let initialOpportunitySMS: SMSMessage | null = null;
    let newAppCreated: JobApplication | null = null;

    // Auto-create application and initial opportunity message if worker has not received one yet
    if (!currentApp) {
      newAppCreated = {
        id: `APP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        jobId: actualJobId,
        workerId,
        status: 'sent',
        sentAt: new Date(Date.now() - 60000).toISOString()
      };
      currentApp = newAppCreated;

      const oppText = smsService.generateOpportunitySMS(
        {
          title: targetJob?.title || 'Painting Project - 4-Storey Exterior Weather Coating',
          location: targetJob?.location || 'Mapusa Industrial Area, Goa',
          date: targetJob?.startDate || '18 Sept 2026',
          duration: targetJob?.durationDays || 5,
          rate: targetJob?.paymentAmount || 800,
          workers: targetJob?.workersRequired || 10
        },
        workerLang
      );

      initialOpportunitySMS = {
        id: `SMS-INIT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        jobId: actualJobId,
        workerId,
        workerPhone,
        workerName,
        direction: 'outgoing',
        content: oppText,
        timestamp: new Date(Date.now() - 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'delivered',
        step: 'opportunity'
      };
    }

    // Parse the command strictly using smsService
    const parsed = smsService.parseSMSResponse(reply);

    // 1. Log incoming SMS
    const incomingSMS: SMSMessage = {
      id: `SMS-IN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      jobId: actualJobId,
      workerId,
      workerPhone,
      workerName,
      direction: 'incoming',
      content: reply,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
        jobId: actualJobId,
        workerId,
        workerPhone,
        workerName,
        direction: 'outgoing',
        content: invalidGuideSMS,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'delivered',
        step: 'info'
      };

      const newMessages = [
        outgoingGuide, 
        incomingSMS,
        ...(initialOpportunitySMS ? [initialOpportunitySMS] : [])
      ];
      setSmsMessages(prev => [...newMessages, ...prev]);
      if (newAppCreated) {
        setApplications(prev => [newAppCreated!, ...prev]);
      }
      addToast('Safe Guidance Sent', `Worker replied "${reply}". System preserved job state and sent SMS help prompt.`, 'warning');
      return;
    }

    const nextStatus = transition.nextStatus;
    const now = new Date().toISOString();

    const updatedApp: JobApplication = {
      ...currentApp,
      status: nextStatus,
      respondedAt: now,
      viewedAt: nextStatus === 'details_requested' ? now : currentApp.viewedAt
    };

    // 3. Update application state
    setApplications(prev => {
      const filtered = prev.filter(a => a.id !== updatedApp.id && !( (a.jobId === actualJobId || a.jobId === jobId) && a.workerId === workerId ));
      return [updatedApp, ...filtered];
    });

    // 4. Update job interested/assigned IDs
    setJobs(prev => prev.map(j => {
      if (j.id === actualJobId || j.id === jobId) {
        let interested = [...j.interestedWorkerIds];
        if (nextStatus === 'accepted' && !interested.includes(workerId)) {
          interested.push(workerId);
        } else if (nextStatus === 'rejected') {
          interested = interested.filter(id => id !== workerId);
        }
        return {
          ...j,
          status: interested.length > 0 ? 'responses_received' : j.status,
          notifiedWorkerIds: Array.from(new Set([...j.notifiedWorkerIds, workerId])),
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

    const outgoingSMS: SMSMessage = {
      id: `SMS-OUT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      jobId: actualJobId,
      workerId,
      workerPhone,
      workerName,
      direction: 'outgoing',
      content: replyContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'delivered',
      step: transition.outgoingStep || 'info'
    };

    const newMessages = [
      outgoingSMS, 
      incomingSMS,
      ...(initialOpportunitySMS ? [initialOpportunitySMS] : [])
    ];
    setSmsMessages(prev => [...newMessages, ...prev]);

    // Background sync to Firebase
    firebaseService.syncApplication(updatedApp);
    if (initialOpportunitySMS) firebaseService.syncSMSMessage(initialOpportunitySMS);
    firebaseService.syncSMSMessage(incomingSMS);
    firebaseService.syncSMSMessage(outgoingSMS);

    // Toast feedback
    if (nextStatus === 'details_requested') {
      addToast(`${workerName} Requested Details`, 'Job terms sent via SMS.', 'info');
    } else if (nextStatus === 'accepted') {
      addToast(`${workerName} Accepted Terms!`, 'Worker ready for assignment.', 'success');
    } else if (nextStatus === 'rejected') {
      addToast(`${workerName} Declined Opportunity`, 'Status updated to REJECTED.', 'warning');
    }
  };

  const assignWorker = async (jobId: string, workerId: string): Promise<void> => {
    // 1. Assign via backend SQLite database transaction
    try {
      const assignedJob = await apiClient.assignWorker(jobId, workerId);
      if (assignedJob) {
        setJobs(prev => prev.map(j => j.id === jobId ? assignedJob : j));
        const freshApps = await apiClient.getApplications();
        if (freshApps) setApplications(freshApps);
        const freshSms = await apiClient.getSMSLogs();
        if (freshSms) setSmsMessages(freshSms);
        addToast('Worker Assigned Successfully', `Assigned worker to "${assignedJob.title}"`, 'success');
        return;
      }
    } catch (apiErr: any) {
      if (apiErr.message?.includes('quota') || apiErr.message?.includes('must reply 1')) {
        addToast('Assignment Guard', apiErr.message, 'warning');
        return;
      }
      console.warn('Backend assignWorker note, falling back:', apiErr);
    }

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
      if (a.jobId === jobId && (a.workerId === workerId || (workerUser && (a.workerId === workerUser.id || a.workerId === workerUser.freelancerProfile?.freelancerId)))) {
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
    // 1. Complete via backend SQLite database transaction
    try {
      const completedJob = await apiClient.completeJob(jobId);
      if (completedJob) {
        setJobs(prev => prev.map(j => j.id === jobId ? completedJob : j));
        const freshSms = await apiClient.getSMSLogs();
        if (freshSms) setSmsMessages(freshSms);
        if (currentUser?.role === 'freelancer') {
          const hist = await apiClient.getFreelancerHistory(currentUser.id);
          if (hist) setWorkHistory(hist);
        }
        addToast('Work Marked Completed!', 'Logged in official persistent database work history ledger.', 'success');
        return;
      }
    } catch (apiErr) {
      console.warn('Backend completeJob note, falling back:', apiErr);
    }

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
        selectedJobIdForDemo,
        setSelectedJobIdForDemo,
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
