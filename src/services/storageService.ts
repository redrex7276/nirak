import { User, Job, JobApplication, SMSMessage, WorkHistoryItem, LanguageCode } from '../types';
import { SEED_USERS, INITIAL_JOBS, INITIAL_WORK_HISTORY, INITIAL_APPLICATIONS, INITIAL_SMS_MESSAGES } from '../data/seedData';

const STORAGE_KEYS = {
  USERS: 'shramik_users_v1',
  CURRENT_USER: 'shramik_current_user_v1',
  JOBS: 'shramik_jobs_v1',
  APPLICATIONS: 'shramik_applications_v1',
  SMS_MESSAGES: 'shramik_sms_messages_v1',
  WORK_HISTORY: 'shramik_work_history_v1',
  LANGUAGE: 'shramik_lang_v1',
};

// Universal storage adapter ensuring seamless execution in browser and test/SSR runtimes
const memoryStore: Record<string, string> = {};

function safeGet(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch {
    // ignore access error
  }
  return memoryStore[key] || null;
}

function safeSet(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch {
    // ignore access error
  }
  memoryStore[key] = value;
}

function safeRemove(key: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  } catch {
    // ignore access error
  }
  delete memoryStore[key];
}

export const storageService = {
  getUsers(): User[] {
    const data = safeGet(STORAGE_KEYS.USERS);
    if (!data) {
      this.saveUsers(SEED_USERS);
      return SEED_USERS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return SEED_USERS;
    }
  },

  saveUsers(users: User[]): void {
    try {
      safeSet(STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save users', e);
    }
  },

  getCurrentUser(): User | null {
    const data = safeGet(STORAGE_KEYS.CURRENT_USER);
    if (!data || data === 'null') {
      return null;
    }
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  },

  setCurrentUser(user: User | null): void {
    try {
      if (user) {
        safeSet(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      } else {
        safeRemove(STORAGE_KEYS.CURRENT_USER);
      }
    } catch (e) {
      console.error('Failed to set current user', e);
    }
  },

  getJobs(): Job[] {
    const data = safeGet(STORAGE_KEYS.JOBS);
    if (!data) {
      this.saveJobs(INITIAL_JOBS);
      return INITIAL_JOBS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_JOBS;
    }
  },

  saveJobs(jobs: Job[]): void {
    try {
      safeSet(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
    } catch (e) {
      console.error('Failed to save jobs', e);
    }
  },

  getApplications(): JobApplication[] {
    const data = safeGet(STORAGE_KEYS.APPLICATIONS);
    if (!data) {
      this.saveApplications(INITIAL_APPLICATIONS);
      return INITIAL_APPLICATIONS;
    }
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
      this.saveApplications(INITIAL_APPLICATIONS);
      return INITIAL_APPLICATIONS;
    } catch {
      return INITIAL_APPLICATIONS;
    }
  },

  saveApplications(apps: JobApplication[]): void {
    try {
      safeSet(STORAGE_KEYS.APPLICATIONS, JSON.stringify(apps));
    } catch (e) {
      console.error('Failed to save applications', e);
    }
  },

  getSMSMessages(): SMSMessage[] {
    const data = safeGet(STORAGE_KEYS.SMS_MESSAGES);
    if (!data) {
      this.saveSMSMessages(INITIAL_SMS_MESSAGES);
      return INITIAL_SMS_MESSAGES;
    }
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
      this.saveSMSMessages(INITIAL_SMS_MESSAGES);
      return INITIAL_SMS_MESSAGES;
    } catch {
      return INITIAL_SMS_MESSAGES;
    }
  },

  saveSMSMessages(msgs: SMSMessage[]): void {
    try {
      safeSet(STORAGE_KEYS.SMS_MESSAGES, JSON.stringify(msgs));
    } catch (e) {
      console.error('Failed to save SMS messages', e);
    }
  },

  getWorkHistory(): WorkHistoryItem[] {
    const data = safeGet(STORAGE_KEYS.WORK_HISTORY);
    if (!data) {
      this.saveWorkHistory(INITIAL_WORK_HISTORY);
      return INITIAL_WORK_HISTORY;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_WORK_HISTORY;
    }
  },

  saveWorkHistory(history: WorkHistoryItem[]): void {
    try {
      safeSet(STORAGE_KEYS.WORK_HISTORY, JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save work history', e);
    }
  },

  getLanguage(): LanguageCode {
    const lang = safeGet(STORAGE_KEYS.LANGUAGE) as LanguageCode;
    return (lang === 'en' || lang === 'hi' || lang === 'mr') ? lang : 'en';
  },

  setLanguage(lang: LanguageCode): void {
    try {
      safeSet(STORAGE_KEYS.LANGUAGE, lang);
    } catch (e) {
      console.error('Failed to set language', e);
    }
  },

  resetToDefaults(): void {
    safeRemove(STORAGE_KEYS.USERS);
    safeRemove(STORAGE_KEYS.CURRENT_USER);
    safeRemove(STORAGE_KEYS.JOBS);
    safeRemove(STORAGE_KEYS.APPLICATIONS);
    safeRemove(STORAGE_KEYS.SMS_MESSAGES);
    safeRemove(STORAGE_KEYS.WORK_HISTORY);
    this.saveUsers(SEED_USERS);
    this.saveJobs(INITIAL_JOBS);
    this.saveApplications(INITIAL_APPLICATIONS);
    this.saveSMSMessages(INITIAL_SMS_MESSAGES);
    this.saveWorkHistory(INITIAL_WORK_HISTORY);
  }
};
