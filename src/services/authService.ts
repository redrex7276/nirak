import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';

export interface PhoneAuthSession {
  confirmationResult: ConfirmationResult;
  verificationId: string;
}

class AuthService {
  private recaptchaVerifier: RecaptchaVerifier | null = null;

  /**
   * Listen to Firebase Auth state changes
   */
  subscribeToAuth(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  /**
   * Current Firebase User
   */
  getCurrentFirebaseUser(): FirebaseUser | null {
    return auth.currentUser;
  }

  /**
   * Email and Password Sign In
   */
  async loginWithEmail(email: string, password: string):Promise<FirebaseUser> {
    const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
    return userCredential.user;
  }

  /**
   * Email and Password Registration
   */
  async registerWithEmail(email: string, password: string): Promise<FirebaseUser> {
    const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    return userCredential.user;
  }

  /**
   * Google Sign In Popup
   */
  async loginWithGoogle(): Promise<FirebaseUser> {
    const userCredential = await signInWithPopup(auth, googleProvider);
    return userCredential.user;
  }

  /**
   * Initialize or reuse reCAPTCHA verifier for Phone Auth
   */
  initRecaptcha(containerId: string = 'recaptcha-container'): RecaptchaVerifier {
    if (this.recaptchaVerifier) {
      try {
        this.recaptchaVerifier.clear();
      } catch {
        // ignore reset error
      }
      this.recaptchaVerifier = null;
    }

    this.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved - will proceed with submit
      },
      'expired-callback': () => {
        console.warn('reCAPTCHA expired. Please try again.');
      }
    });

    return this.recaptchaVerifier;
  }

  /**
   * Send SMS OTP to phone number
   * @param rawNumber Phone number in international format or 10-digit Indian number (+91 will be prefixed)
   * @param containerId HTML element id for reCAPTCHA widget
   */
  async sendPhoneOtp(rawNumber: string, containerId: string = 'recaptcha-container'): Promise<ConfirmationResult> {
    let clean = rawNumber.trim().replace(/\s+/g, '');
    if (!clean.startsWith('+')) {
      if (clean.length === 10) {
        clean = `+91${clean}`;
      } else {
        clean = `+${clean}`;
      }
    }

    const verifier = this.initRecaptcha(containerId);
    const confirmationResult = await signInWithPhoneNumber(auth, clean, verifier);
    return confirmationResult;
  }

  /**
   * Confirm Phone SMS OTP
   */
  async verifyPhoneOtp(confirmationResult: ConfirmationResult, code: string): Promise<FirebaseUser> {
    const credential = await confirmationResult.confirm(code.trim());
    return credential.user;
  }

  /**
   * Sign Out
   */
  async logout(): Promise<void> {
    if (this.recaptchaVerifier) {
      try {
        this.recaptchaVerifier.clear();
      } catch {
        // ignore
      }
      this.recaptchaVerifier = null;
    }
    await signOut(auth);
  }
}

export const authService = new AuthService();
