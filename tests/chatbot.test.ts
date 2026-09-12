import { describe, it, expect } from 'vitest';
import { chatbotService } from '../src/services/chatbotService';

describe('Shramik AI Chatbot Service & Knowledge Engine', () => {
  it('correctly provides zero-data SMS guidance for worker workflow queries', () => {
    const res = chatbotService.generateLocalKnowledgeReply('How does SMS work without internet?');
    expect(res.reply).toContain('Zero-Data SMS Opportunity Bridge');
    expect(res.reply).toContain('No App or Smartphone Required');
    expect(res.reply).toContain('Two-Step Numeric Response');
    expect(res.actions.some(a => a.route === '/how-it-works')).toBe(true);
  });

  it('provides accurate wage benchmarks for Goa trades', () => {
    const res = chatbotService.generateLocalKnowledgeReply('What are the daily wage rates for workers?');
    expect(res.reply).toContain('Painter');
    expect(res.reply).toContain('Plumber');
    expect(res.reply).toContain('Carpenter');
    expect(res.reply).toContain('Mechanic');
    expect(res.actions.some(a => a.route === '/quotes')).toBe(true);
  });

  it('matches painting trade and provides verified painter details', () => {
    const res = chatbotService.generateLocalKnowledgeReply('Need a painter for 5 days');
    expect(res.reply).toContain('Ramesh Naik');
    expect(res.reply).toContain('₹800');
    expect(res.actions.some(a => a.route === '/customer/create-work' || a.route === '/customer/workers')).toBe(true);
  });

  it('matches plumbing trade and provides emergency leak guidance', () => {
    const res = chatbotService.generateLocalKnowledgeReply('Bathroom pipe leak in Porvorim');
    expect(res.reply).toContain('Sunil Gaonkar');
    expect(res.reply).toContain('PPR');
    expect(res.actions.length).toBeGreaterThan(0);
  });

  it('explains 2D matching engine vectors accurately', () => {
    const res = chatbotService.generateLocalKnowledgeReply('How does your matching algorithm work?');
    expect(res.reply).toContain('Proximity Score');
    expect(res.reply).toContain('Trade Skill Overlap');
    expect(res.reply).toContain('Language Compatibility');
  });

  it('generates a full ChatMessage structure asynchronously via sendMessage', async () => {
    const msg = await chatbotService.sendMessage('How do workers reply to SMS?');
    expect(msg).toBeDefined();
    expect(msg.sender).toBe('bot');
    expect(msg.text.length).toBeGreaterThan(20);
    expect(msg.actions).toBeDefined();
    expect(msg.actions!.length).toBeGreaterThan(0);
    expect(msg.suggestedQueries).toBeDefined();
    expect(msg.suggestedQueries!.length).toBeGreaterThan(0);
  });
});
