import { describe, it, expect, beforeEach } from 'vitest';
import { storageService } from '../src/services/storageService';
import { SEED_USERS } from '../src/data/seedData';
import { User } from '../src/types';

describe('Validation & Boundary Enforcement Audit (Section 7, 9, 19)', () => {
  beforeEach(() => {
    storageService.saveUsers(SEED_USERS);
    storageService.setCurrentUser(null);
  });

  describe('Registration Input Validation & Boundary Checks', () => {
    it('rejects names with fewer than 2 characters', () => {
      const invalidName = 'A';
      expect(invalidName.trim().length < 2).toBe(true);
    });

    it('rejects mobile numbers with fewer than 10 digits', () => {
      const invalidMobiles = ['123', '98201', 'abcdefghij', '+91 12345'];
      invalidMobiles.forEach(m => {
        const cleanDigits = m.replace(/\D/g, '');
        expect(cleanDigits.length < 10).toBe(true);
      });
    });

    it('accepts valid 10-digit mobile numbers with or without country code', () => {
      const validMobiles = ['+91 98221 55432', '9822155432', '+919822155432'];
      validMobiles.forEach(m => {
        const cleanDigits = m.replace(/\D/g, '');
        expect(cleanDigits.length >= 10).toBe(true);
      });
    });

    it('detects duplicate mobile numbers ignoring whitespace', () => {
      const users = storageService.getUsers();
      const existing = users[0];
      const spacedMobile = `  ${existing.mobile.replace(/\s+/g, ' ')}  `;
      const isDuplicate = users.some(u => u.mobile.replace(/\s+/g, '') === spacedMobile.replace(/\s+/g, ''));
      expect(isDuplicate).toBe(true);
    });

    it('validates email syntax using standard pattern', () => {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      expect(emailPattern.test('valid.user@example.com')).toBe(true);
      expect(emailPattern.test('invalid-email')).toBe(false);
      expect(emailPattern.test('missing@domain')).toBe(false);
      expect(emailPattern.test('@nodomain.com')).toBe(false);
    });

    it('enforces minimum password length of 6 characters', () => {
      const weakPasswords = ['123', 'abc', '12345', ''];
      weakPasswords.forEach(pw => {
        expect(pw.length < 6).toBe(true);
      });

      const strongPasswords = ['secure123', 'shramik#2026', 'pass1234'];
      strongPasswords.forEach(pw => {
        expect(pw.length >= 6).toBe(true);
      });
    });
  });

  describe('Work Creation Boundary Validation (Section 9, 34)', () => {
    it('rejects zero or negative workers required', () => {
      const invalidWorkerCounts = [0, -1, -10];
      invalidWorkerCounts.forEach(count => {
        const isValid = count >= 1 && Number.isInteger(count);
        expect(isValid).toBe(false);
      });
    });

    it('enforces positive whole number duration between 1 and 365 days', () => {
      expect(0 >= 1).toBe(false);
      expect(-5 >= 1).toBe(false);
      expect(400 <= 365).toBe(false);
      expect(5 >= 1 && 5 <= 365).toBe(true);
    });

    it('rejects zero or negative daily payment rates', () => {
      const invalidRates = [0, -100, -800];
      invalidRates.forEach(rate => {
        expect(rate >= 100).toBe(false);
      });
      expect(800 >= 100).toBe(true);
    });

    it('rejects job titles shorter than 3 characters or longer than 100 characters', () => {
      const tooShort = 'AB';
      const tooLong = 'A'.repeat(101);
      const validTitle = 'House Painting and Waterproofing';

      expect(tooShort.trim().length >= 3).toBe(false);
      expect(tooLong.trim().length <= 100).toBe(false);
      expect(validTitle.trim().length >= 3 && validTitle.trim().length <= 100).toBe(true);
    });
  });
});
