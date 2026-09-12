import { describe, it, expect } from 'vitest';
import { app, firebaseConfig, auth, db } from '../src/services/firebase';
import { firebaseService } from '../src/services/firebaseService';

describe('Firebase Backend Integration Audit', () => {
  it('initializes Firebase App with the user-provided config', () => {
    expect(app).toBeDefined();
    expect(app.name).toBe('[DEFAULT]');
    expect(app.options.projectId).toBe('shramik-quote');
    expect(app.options.authDomain).toBe('shramik-quote.firebaseapp.com');
    expect(app.options.storageBucket).toBe('shramik-quote.firebasestorage.app');
    expect(app.options.messagingSenderId).toBe('216325345229');
    expect(app.options.appId).toBe('1:216325345229:web:ec0ba45114afe5823dfe84');
  });

  it('exposes Firebase Auth and Firestore instances', () => {
    expect(auth).toBeDefined();
    expect(db).toBeDefined();
    expect(db.type).toBe('firestore');
  });

  it('checks connection status cleanly', async () => {
    const status = await firebaseService.checkConnection();
    expect(status.connected).toBe(true);
    expect(status.projectId).toBe('shramik-quote');
  });
});
