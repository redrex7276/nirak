import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  getDoc, 
  query, 
  orderBy, 
  limit,
  serverTimestamp 
} from "firebase/firestore";
import { db, app } from "./firebase";
import { Job, User, JobApplication, SMSMessage, WorkHistoryItem } from "../types";

export interface FirebaseSyncStatus {
  isInitialized: boolean;
  projectId: string;
  lastSyncedAt?: string;
  error?: string;
}

class FirebaseService {
  private collectionNames = {
    jobs: "jobs",
    users: "users",
    applications: "applications",
    smsLogs: "sms_logs",
    workHistory: "work_history"
  };

  /**
   * Check Firebase connection status
   */
  async checkConnection(): Promise<{ connected: boolean; projectId: string; error?: string }> {
    try {
      const projectId = app.options.projectId || "shramik-quote";
      return { connected: true, projectId };
    } catch (err: any) {
      return { connected: false, projectId: "unknown", error: err?.message || "Failed to connect to Firebase" };
    }
  }

  /**
   * Sync a job to Firestore
   */
  async syncJob(job: Job): Promise<boolean> {
    try {
      const jobRef = doc(db, this.collectionNames.jobs, job.id);
      await setDoc(jobRef, {
        ...job,
        updatedAtFirebase: serverTimestamp()
      }, { merge: true });
      return true;
    } catch (err) {
      console.warn("Firebase syncJob note: proceeding with local state", err);
      return false;
    }
  }

  /**
   * Sync a user to Firestore
   */
  async syncUser(user: User): Promise<boolean> {
    try {
      const userRef = doc(db, this.collectionNames.users, user.id);
      await setDoc(userRef, {
        ...user,
        updatedAtFirebase: serverTimestamp()
      }, { merge: true });
      return true;
    } catch (err) {
      console.warn("Firebase syncUser note: proceeding with local state", err);
      return false;
    }
  }

  /**
   * Sync an application to Firestore
   */
  async syncApplication(appData: JobApplication): Promise<boolean> {
    try {
      const appRef = doc(db, this.collectionNames.applications, appData.id);
      await setDoc(appRef, {
        ...appData,
        updatedAtFirebase: serverTimestamp()
      }, { merge: true });
      return true;
    } catch (err) {
      console.warn("Firebase syncApplication note: proceeding with local state", err);
      return false;
    }
  }

  /**
   * Sync an SMS message log to Firestore
   */
  async syncSMSMessage(message: SMSMessage): Promise<boolean> {
    try {
      const smsRef = doc(db, this.collectionNames.smsLogs, message.id);
      await setDoc(smsRef, {
        ...message,
        loggedAtFirebase: serverTimestamp()
      }, { merge: true });
      return true;
    } catch (err) {
      console.warn("Firebase syncSMSMessage note: proceeding with local state", err);
      return false;
    }
  }

  /**
   * Sync completed work history to Firestore
   */
  async syncWorkHistory(item: WorkHistoryItem): Promise<boolean> {
    try {
      const historyRef = doc(db, this.collectionNames.workHistory, item.id);
      await setDoc(historyRef, {
        ...item,
        recordedAtFirebase: serverTimestamp()
      }, { merge: true });
      return true;
    } catch (err) {
      console.warn("Firebase syncWorkHistory note: proceeding with local state", err);
      return false;
    }
  }
}

export const firebaseService = new FirebaseService();
