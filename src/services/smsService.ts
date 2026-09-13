import { SMSMessage, SMSStatus, SMSStep, LanguageCode, ApplicationStatus } from '../types';
import { SMS_TEMPLATES, SMSTemplateParams } from '../locales/translations';

export interface OutgoingSMSRequest {
  jobId: string;
  workerId: string;
  workerPhone: string;
  workerName: string;
  content: string;
  step: SMSStep;
  language?: LanguageCode;
}

export interface IncomingSMSRequest {
  jobId: string;
  workerId: string;
  workerPhone: string;
  workerName: string;
  body: string;
}

export interface SMSServiceInterface {
  sendSMS(request: OutgoingSMSRequest): Promise<SMSMessage>;
  sendBulkSMS(requests: OutgoingSMSRequest[]): Promise<SMSMessage[]>;
  parseSMSResponse(text: string): { command: '1' | '0' | 'INVALID'; raw: string };
  generateOpportunitySMS(job: SMSTemplateParams, language: LanguageCode): string;
  generateDetailsSMS(job: SMSTemplateParams, language: LanguageCode): string;
  generateAcceptedSMS(job: SMSTemplateParams, language: LanguageCode): string;
  generateRejectedSMS(job: SMSTemplateParams, language: LanguageCode): string;
  generateAssignedSMS(job: SMSTemplateParams, language: LanguageCode): string;
  generateInvalidReplySMS(language: LanguageCode): string;
}

/**
 * Mock SMS Provider that behaves like an enterprise carrier SMS gateway.
 * Zero external vendor lock-in; easily swappable with Twilio, AWS SNS, MSG91, or Fast2SMS.
 */
class MockSMSProvider implements SMSServiceInterface {
  async sendSMS(request: OutgoingSMSRequest): Promise<SMSMessage> {
    const message: SMSMessage = {
      id: `SMS-OUT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      jobId: request.jobId,
      workerId: request.workerId,
      workerPhone: request.workerPhone,
      workerName: request.workerName,
      direction: 'outgoing',
      content: request.content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      status: 'delivered',
      step: request.step
    };
    return message;
  }

  async sendBulkSMS(requests: OutgoingSMSRequest[]): Promise<SMSMessage[]> {
    return Promise.all(requests.map(req => this.sendSMS(req)));
  }

  parseSMSResponse(text: string): { command: '1' | '0' | 'INVALID'; raw: string } {
    const cleaned = (text || '').trim();
    if (cleaned === '1') {
      return { command: '1', raw: cleaned };
    }
    if (cleaned === '0') {
      return { command: '0', raw: cleaned };
    }
    return { command: 'INVALID', raw: cleaned };
  }

  generateOpportunitySMS(job: SMSTemplateParams, language: LanguageCode = 'en'): string {
    const templates = SMS_TEMPLATES[language] || SMS_TEMPLATES.en;
    return templates.opportunity(job);
  }

  generateDetailsSMS(job: SMSTemplateParams, language: LanguageCode = 'en'): string {
    const templates = SMS_TEMPLATES[language] || SMS_TEMPLATES.en;
    return templates.details(job);
  }

  generateAcceptedSMS(job: SMSTemplateParams, language: LanguageCode = 'en'): string {
    const templates = SMS_TEMPLATES[language] || SMS_TEMPLATES.en;
    return templates.accepted(job);
  }

  generateRejectedSMS(job: SMSTemplateParams, language: LanguageCode = 'en'): string {
    const templates = SMS_TEMPLATES[language] || SMS_TEMPLATES.en;
    return templates.rejected(job);
  }

  generateAssignedSMS(job: SMSTemplateParams, language: LanguageCode = 'en'): string {
    const templates = SMS_TEMPLATES[language] || SMS_TEMPLATES.en;
    return templates.assigned(job);
  }

  generateInvalidReplySMS(language: LanguageCode = 'en'): string {
    const templates = SMS_TEMPLATES[language] || SMS_TEMPLATES.en;
    return templates.invalidReply();
  }
}

export const smsService = new MockSMSProvider();

/**
 * Deterministic SMS Response State Machine
 *
 * Current State        Incoming 1               Incoming 0          Invalid
 * ----------------------------------------------------------------------------------
 * sent                 details_requested        rejected            prompt
 * details_requested    accepted                 rejected            prompt
 * accepted             (already accepted)       rejected            prompt
 */
export function evaluateSMSStateTransition(
  currentStatus: ApplicationStatus | string,
  incomingCommand: '1' | '0' | 'INVALID'
): {
  nextStatus: ApplicationStatus | null;
  outgoingStep: SMSStep | null;
  errorMessage?: string;
} {
  if (incomingCommand === 'INVALID') {
    return {
      nextStatus: null,
      outgoingStep: 'info',
      errorMessage: 'Invalid numeric response. Please reply 1 or 0.'
    };
  }

  // Initial opportunity stage
  if (currentStatus === 'sent' || currentStatus === 'sms_sent') {
    if (incomingCommand === '1') {
      return {
        nextStatus: 'details_requested',
        outgoingStep: 'details'
      };
    } else {
      return {
        nextStatus: 'rejected',
        outgoingStep: 'acceptance'
      };
    }
  }

  // Job details viewed stage
  if (currentStatus === 'details_requested' || currentStatus === 'details_sent') {
    if (incomingCommand === '1') {
      return {
        nextStatus: 'accepted',
        outgoingStep: 'acceptance'
      };
    } else {
      return {
        nextStatus: 'rejected',
        outgoingStep: 'acceptance'
      };
    }
  }

  // Accepted stage
  if (currentStatus === 'accepted') {
    if (incomingCommand === '0') {
      return {
        nextStatus: 'rejected',
        outgoingStep: 'acceptance'
      };
    }
    return {
      nextStatus: 'accepted',
      outgoingStep: 'acceptance'
    };
  }

  // Assigned stage
  if (currentStatus === 'assigned') {
    if (incomingCommand === '0') {
      return {
        nextStatus: 'rejected',
        outgoingStep: 'acceptance'
      };
    }
    return {
      nextStatus: 'assigned',
      outgoingStep: 'acceptance'
    };
  }

  // Rejected stage (re-engaging)
  if (currentStatus === 'rejected') {
    if (incomingCommand === '1') {
      return {
        nextStatus: 'details_requested',
        outgoingStep: 'details'
      };
    }
    return {
      nextStatus: 'rejected',
      outgoingStep: 'acceptance'
    };
  }

  // Default fallback for any unknown status: reply 1 -> details, 0 -> rejected
  if (incomingCommand === '1') {
    return {
      nextStatus: 'details_requested',
      outgoingStep: 'details'
    };
  } else if (incomingCommand === '0') {
    return {
      nextStatus: 'rejected',
      outgoingStep: 'acceptance'
    };
  }

  return {
    nextStatus: null,
    outgoingStep: null
  };
}
