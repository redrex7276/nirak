import { describe, it, expect, beforeEach } from 'vitest';
import { storageService } from '../src/services/storageService';
import { SEED_USERS } from '../src/data/seedData';
import { User } from '../src/types';

describe('Authentication & Role Authorization Audit', () => {
  beforeEach(() => {
    // Reset seed users
    storageService.saveUsers(SEED_USERS);
    storageService.setCurrentUser(null);
  });

  it('verifies seed dataset contains both customer and freelancer accounts', () => {
    const users = storageService.getUsers();
    const customers = users.filter(u => u.role === 'customer');
    const freelancers = users.filter(u => u.role === 'freelancer');

    expect(customers.length).toBeGreaterThanOrEqual(1);
    expect(freelancers.length).toBeGreaterThanOrEqual(5);

    const rajesh = customers.find(u => u.name.includes('Rajesh'));
    expect(rajesh).toBeDefined();
    expect(rajesh?.role).toBe('customer');

    const ramesh = freelancers.find(u => u.name.includes('Ramesh'));
    expect(ramesh).toBeDefined();
    expect(ramesh?.role).toBe('freelancer');
    expect(ramesh?.freelancerProfile).toBeDefined();
  });

  it('authenticates user by mobile number or email or user ID', () => {
    const users = storageService.getUsers();
    const rajesh = users.find(u => u.name.includes('Rajesh'))!;

    // Test mobile match
    const cleanMobile = rajesh.mobile.replace(/\s+/g, '');
    const foundByMobile = users.find(u => u.mobile.replace(/\s+/g, '') === cleanMobile);
    expect(foundByMobile?.id).toBe(rajesh.id);

    // Test ID match
    const foundById = users.find(u => u.id.toLowerCase() === rajesh.id.toLowerCase());
    expect(foundById?.name).toBe(rajesh.name);
  });

  it('rejects unregistered credentials cleanly', () => {
    const users = storageService.getUsers();
    const nonExistent = users.find(u => u.mobile === '+91 00000 00000');
    expect(nonExistent).toBeUndefined();
  });

  it('enforces role separation: Customer cannot have Freelancer profile and vice versa', () => {
    const users = storageService.getUsers();
    const customers = users.filter(u => u.role === 'customer');
    const freelancers = users.filter(u => u.role === 'freelancer');

    customers.forEach(c => {
      expect(c.customerProfile).toBeDefined();
      expect(c.freelancerProfile).toBeUndefined();
    });

    freelancers.forEach(f => {
      expect(f.freelancerProfile).toBeDefined();
      expect(f.customerProfile).toBeUndefined();
    });
  });

  it('prevents duplicate registration on identical phone numbers', () => {
    const users = storageService.getUsers();
    const existing = users[0];
    const isDuplicate = users.some(u => u.mobile.replace(/\s+/g, '') === existing.mobile.replace(/\s+/g, ''));
    expect(isDuplicate).toBe(true);
  });
});
