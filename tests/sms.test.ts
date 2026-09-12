import { describe, it, expect } from 'vitest';
import { smsService, evaluateSMSStateTransition } from '../src/services/smsService';
import { SMS_TEMPLATES } from '../src/locales/translations';

describe('SMS Service & State Machine Audit', () => {
  describe('Strict Numeric SMS Input Validation', () => {
    it('correctly accepts exact "1" as details/acceptance command', () => {
      const res = smsService.parseSMSResponse('1');
      expect(res.command).toBe('1');
      expect(res.raw).toBe('1');
    });

    it('correctly accepts exact "0" as reject/ignore command', () => {
      const res = smsService.parseSMSResponse('0');
      expect(res.command).toBe('0');
      expect(res.raw).toBe('0');
    });

    it('strips leading/trailing whitespace around valid numbers', () => {
      expect(smsService.parseSMSResponse('  1  ').command).toBe('1');
      expect(smsService.parseSMSResponse('\n0\t').command).toBe('0');
    });

    it('strictly rejects multi-digit and malformed numeric inputs (Section 6)', () => {
      // Must not treat 1 1, 10, 00, 01 as valid 1 or 0
      expect(smsService.parseSMSResponse('1 1').command).toBe('INVALID');
      expect(smsService.parseSMSResponse('10').command).toBe('INVALID');
      expect(smsService.parseSMSResponse('00').command).toBe('INVALID');
      expect(smsService.parseSMSResponse('01').command).toBe('INVALID');
      expect(smsService.parseSMSResponse('2').command).toBe('INVALID');
      expect(smsService.parseSMSResponse('3').command).toBe('INVALID');
      expect(smsService.parseSMSResponse('9').command).toBe('INVALID');
    });

    it('strictly rejects text words and arbitrary strings (Section 6)', () => {
      expect(smsService.parseSMSResponse('yes').command).toBe('INVALID');
      expect(smsService.parseSMSResponse('no').command).toBe('INVALID');
      expect(smsService.parseSMSResponse('accept').command).toBe('INVALID');
      expect(smsService.parseSMSResponse('random text').command).toBe('INVALID');
      expect(smsService.parseSMSResponse('').command).toBe('INVALID');
      expect(smsService.parseSMSResponse('   ').command).toBe('INVALID');
      expect(smsService.parseSMSResponse('1abc').command).toBe('INVALID');
      expect(smsService.parseSMSResponse('0xyz').command).toBe('INVALID');
    });
  });

  describe('SMS State Machine Transitions', () => {
    it('transitions sent -> details_requested on command "1"', () => {
      const result = evaluateSMSStateTransition('sent', '1');
      expect(result.nextStatus).toBe('details_requested');
      expect(result.outgoingStep).toBe('details');
    });

    it('transitions sent -> rejected on command "0"', () => {
      const result = evaluateSMSStateTransition('sent', '0');
      expect(result.nextStatus).toBe('rejected');
      expect(result.outgoingStep).toBe('acceptance');
    });

    it('transitions details_requested -> accepted on command "1"', () => {
      const result = evaluateSMSStateTransition('details_requested', '1');
      expect(result.nextStatus).toBe('accepted');
      expect(result.outgoingStep).toBe('acceptance');
    });

    it('transitions details_requested -> rejected on command "0"', () => {
      const result = evaluateSMSStateTransition('details_requested', '0');
      expect(result.nextStatus).toBe('rejected');
      expect(result.outgoingStep).toBe('acceptance');
    });

    it('transitions accepted -> rejected if worker replies "0"', () => {
      const result = evaluateSMSStateTransition('accepted', '0');
      expect(result.nextStatus).toBe('rejected');
    });

    it('safely handles INVALID command without advancing state (prevents corruption)', () => {
      const result = evaluateSMSStateTransition('sent', 'INVALID');
      expect(result.nextStatus).toBeNull();
      expect(result.outgoingStep).toBe('info');
      expect(result.errorMessage).toBeDefined();

      const resultDetails = evaluateSMSStateTransition('details_requested', 'INVALID');
      expect(resultDetails.nextStatus).toBeNull();
      expect(resultDetails.outgoingStep).toBe('info');
    });
  });

  describe('Multilingual SMS Templates', () => {
    const jobParams = {
      title: 'Painting Work',
      location: 'Mapusa',
      date: '18 Sept',
      duration: 5,
      rate: 800,
      workers: 3,
      time: '8:00 AM'
    };

    it('generates English opportunity and details SMS', () => {
      const opp = smsService.generateOpportunitySMS(jobParams, 'en');
      expect(opp).toContain('New work opportunity');
      expect(opp).toContain('Reply:');
      expect(opp).toContain('1 — View Details');

      const details = smsService.generateDetailsSMS(jobParams, 'en');
      expect(details).toContain('JOB DETAILS');
      expect(details).toContain('1 — ACCEPT WORK');
    });

    it('generates Hindi opportunity and details SMS', () => {
      const opp = smsService.generateOpportunitySMS(jobParams, 'hi');
      expect(opp).toContain('नया काम उपलब्ध है');
      expect(opp).toContain('1 — विवरण देखें');

      const details = smsService.generateDetailsSMS(jobParams, 'hi');
      expect(details).toContain('काम का पूरा विवरण');
      expect(details).toContain('1 — काम स्वीकारें');
    });

    it('generates Marathi opportunity and details SMS', () => {
      const opp = smsService.generateOpportunitySMS(jobParams, 'mr');
      expect(opp).toContain('नवीन काम उपलब्ध आहे');
      expect(opp).toContain('1 — तपशील पहा');

      const details = smsService.generateDetailsSMS(jobParams, 'mr');
      expect(details).toContain('कामाचा संपूर्ण तपशील');
      expect(details).toContain('1 — काम स्वीकारा');
    });

    it('provides localized safe invalid reply guidance prompts', () => {
      expect(smsService.generateInvalidReplySMS('en')).toContain('Please reply 1 to view details');
      expect(smsService.generateInvalidReplySMS('hi')).toContain('कृपया विवरण देखने के लिए 1');
      expect(smsService.generateInvalidReplySMS('mr')).toContain('कृपया तपशील पाहण्यासाठी 1');
    });
  });
});
