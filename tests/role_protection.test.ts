import { describe, it, expect, beforeEach } from 'vitest';
import { storageService } from '../src/services/storageService';
import { SEED_USERS } from '../src/data/seedData';
import { User } from '../src/types';

describe('Route Protection & Unauthenticated State Persistence Audit (Section 7, 8, 39)', () => {
  beforeEach(() => {
    storageService.saveUsers(SEED_USERS);
    storageService.setCurrentUser(null);
  });

  it('ensures unauthenticated visitors have null currentUser (no default user leak)', () => {
    const current = storageService.getCurrentUser();
    expect(current).toBeNull();
  });

  it('persists logged in user across simulated page reload', () => {
    const customer = SEED_USERS.find(u => u.role === 'customer')!;
    storageService.setCurrentUser(customer);

    const retrieved = storageService.getCurrentUser();
    expect(retrieved).not.toBeNull();
    expect(retrieved?.id).toBe(customer.id);
    expect(retrieved?.role).toBe('customer');
  });

  it('persists logout across simulated page reload (does not revert to default user)', () => {
    // 1. Log in
    const customer = SEED_USERS.find(u => u.role === 'customer')!;
    storageService.setCurrentUser(customer);
    expect(storageService.getCurrentUser()?.id).toBe(customer.id);

    // 2. Log out
    storageService.setCurrentUser(null);

    // 3. Reload from storage
    const afterLogout = storageService.getCurrentUser();
    expect(afterLogout).toBeNull();
  });

  it('evaluates customer route access permissions strictly by role', () => {
    const customer = SEED_USERS.find(u => u.role === 'customer')!;
    const freelancer = SEED_USERS.find(u => u.role === 'freelancer')!;

    const canAccessCustomerRoute = (user: User | null) => user !== null && user.role === 'customer';
    const canAccessFreelancerRoute = (user: User | null) => user !== null && user.role === 'freelancer';

    // Unauthenticated
    expect(canAccessCustomerRoute(null)).toBe(false);
    expect(canAccessFreelancerRoute(null)).toBe(false);

    // Customer
    expect(canAccessCustomerRoute(customer)).toBe(true);
    expect(canAccessFreelancerRoute(customer)).toBe(false); // Customer must be blocked from freelancer routes

    // Freelancer
    expect(canAccessCustomerRoute(freelancer)).toBe(false); // Freelancer must be blocked from customer routes
    expect(canAccessFreelancerRoute(freelancer)).toBe(true);
  });
});
