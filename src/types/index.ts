export type UserRole = 'customer' | 'freelancer';

export type LanguageCode = 'en' | 'hi' | 'mr';

export type WorkerSkill = 
  | 'Plumber' 
  | 'Painter' 
  | 'Carpenter' 
  | 'Electrician' 
  | 'Mason' 
  | 'Mechanic' 
  | 'Welder' 
  | 'Construction' 
  | 'Cleaner' 
  | 'Agricultural'
  | 'Other';

export type CustomerType = 
  | 'individual' 
  | 'contractor' 
  | 'business' 
  | 'other'
  | 'interior_designer'
  | 'facility_manager'
  | 'homeowner'
  | 'resort_manager';

export type WorkerAvailability = 'available' | 'busy' | 'on_leave';

export interface User {
  id: string;
  role: UserRole;
  name: string;
  mobile: string;
  email?: string;
  location: string;
  createdAt: string;
  updatedAt?: string;
  customerProfile?: CustomerProfile;
  freelancerProfile?: FreelancerProfile;
}

export interface CustomerProfile {
  customerType: CustomerType;
  businessName?: string;
  cityArea: string;
  description?: string;
  frequentGigsNeeded?: string[];
  budgetRange?: string;
  typicalWorkerCount?: string;
}

export interface FreelancerProfile {
  freelancerId: string; // e.g. 'SQ-F-1042'
  primarySkill: WorkerSkill;
  additionalSkills: string[];
  experienceYears: number;
  location: string;
  distanceKm?: number;
  preferredLanguage: LanguageCode;
  availability: WorkerAvailability;
  rating: number;
  jobsCompleted: number;
  dailyRate: number;
  bio: string;
  serviceAreas: string[];
  certifications: string[];
  verified: boolean;
  avatarBg: string;
}

export type JobStatus = 
  | 'draft' 
  | 'open' 
  | 'sms_sent' 
  | 'responses_received' 
  | 'assigned' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled';

export interface Job {
  id: string;
  customerId: string;
  customerName: string;
  title: string;
  category: WorkerSkill;
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
  paymentNotes?: string;
  status: JobStatus;
  shortlistedWorkerIds: string[];
  notifiedWorkerIds: string[];
  interestedWorkerIds: string[];
  assignedWorkerIds: string[];
  completedWorkerIds: string[];
  createdAt: string;
}

export type ApplicationStatus = 
  | 'sent' 
  | 'details_requested' 
  | 'accepted' 
  | 'rejected' 
  | 'assigned' 
  | 'completed';

export interface JobApplication {
  id: string;
  jobId: string;
  workerId: string;
  status: ApplicationStatus;
  sentAt: string;
  viewedAt?: string;
  respondedAt?: string;
  assignedAt?: string;
  completedAt?: string;
  workerNotes?: string;
}

export type SMSDirection = 'outgoing' | 'incoming';

export type SMSStatus = 'queued' | 'sent' | 'delivered' | 'failed';

export type SMSStep = 'opportunity' | 'details' | 'acceptance' | 'assignment' | 'info';

export interface SMSMessage {
  id: string;
  jobId?: string;
  workerId?: string;
  workerPhone: string;
  workerName: string;
  direction: SMSDirection;
  content: string;
  timestamp: string;
  status: SMSStatus;
  step: SMSStep;
}

export interface WorkHistoryItem {
  id: string;
  workerId: string;
  jobId: string;
  jobTitle: string;
  category: WorkerSkill;
  location: string;
  completedDate: string;
  durationDays: number;
  rating: number;
  feedback: string;
  earnedAmount: number;
  customerName: string;
}

export interface MatchResult {
  worker: FreelancerProfile & { id: string; name: string; phone: string };
  matchScore: number;
  breakdown: {
    skillScore: number;
    locationScore: number;
    experienceScore: number;
    availabilityScore: number;
    languageScore: number;
  };
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'warning' | 'error' | 'info';
}
