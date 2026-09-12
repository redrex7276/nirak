import { User, Job, JobApplication, SMSMessage, WorkHistoryItem, LanguageCode } from '../types';
import { SEED_USERS, INITIAL_JOBS, INITIAL_WORK_HISTORY } from '../data/seedData';

const STORAGE_KEYS = {
  USERS: 'shramik_users_v1',
  CURRENT_USER: 'shramik_current_user_v1',
  JOBS: 'shramik_jobs_v1',
  APPLICATIONS: 'shramik_applications_v1',
  SMS_MESSAGES: 'shramik_sms_messages_v1',
  WORK_HISTORY: 'shramik_work_history_v1',
  LANGUAGE: 'shramik_lang_v1',
};

export const storageService = {
  getUsers(): User[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      if (!data) {
        this.saveUsers(SEED_USERS);
        return SEED_USERS;
      }
      return JSON.parse(data);
    } catch {
      return SEED_USERS;
    }
  },

  saveUsers(users: User[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save users', e);
    }
  },

  getCurrentUser(): User | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (!data) {
        // Default to Rajesh Sharma (Customer) for quick preview, or null
        const users = this.getUsers();
        return users.find(u => u.id === 'SQ-C-201') || users[0];
      }
      return JSON.parse(data);
    } catch {
      return null;
    }
  },

  setCurrentUser(user: User | null): void {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      }
    } catch (e) {
      console.error('Failed to set current user', e);
    }
  },

  getJobs(): Job[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.JOBS);
      if (!data) {
        this.saveJobs(INITIAL_JOBS);
        return INITIAL_JOBS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_JOBS;
    }
  },

  saveJobs(jobs: Job[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
    } catch (e) {
      console.error('Failed to save jobs', e);
    }
  },

  getApplications(): JobApplication[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveApplications(apps: JobApplication[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(apps));
    } catch (e) {
      console.error('Failed to save applications', e);
    }
  },

  getSMSMessages(): SMSMessage[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SMS_MESSAGES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveSMSMessages(msgs: SMSMessage[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SMS_MESSAGES, JSON.stringify(msgs));
    } catch (e) {
      console.error('Failed to save SMS messages', e);
    }
  },

  getWorkHistory(): WorkHistoryItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WORK_HISTORY);
      if (!data) {
        this.saveWorkHistory(INITIAL_WORK_HISTORY);
        return INITIAL_WORK_HISTORY;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_WORK_HISTORY;
    }
  },

  saveWorkHistory(history: WorkHistoryItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.WORK_HISTORY, JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save work history', e);
    }
  },

  getLanguage(): LanguageCode {
    try {
      const lang = localStorage.getItem(STORAGE_KEYS.LANGUAGE) as LanguageCode;
      return (lang === 'en' || lang === 'hi' || lang === 'mr') ? lang : 'en';
    } catch {
      return 'en';
    }
  },

  setLanguage(lang: LanguageCode): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
    } catch (e) {
      console.error('Failed to set language', e);
    }
  },

  resetToDefaults(): void {
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.JOBS);
    localStorage.removeItem(STORAGE_KEYS.APPLICATIONS);
    localStorage.removeItem(STORAGE_KEYS.SMS_MESSAGES);
    localStorage.removeItem(STORAGE_KEYS.WORK_HISTORY);
    this.saveUsers(SEED_USERS);
    this.saveJobs(INITIAL_JOBS);
    this.saveWorkHistory(INITIAL_WORK_HISTORY);
  }
};
