import { describe, it, expect } from 'vitest';
import { calculateWorkerMatchScore, findMatchingWorkers } from '../src/services/matchingService';
import { Job, FreelancerProfile, User } from '../src/types';

describe('Worker Matching Engine Audit', () => {
  const sampleJob: Job = {
    id: 'TEST-J-1',
    customerId: 'CUST-1',
    customerName: 'Rajesh Sharma',
    title: 'House Painting',
    category: 'Painting',
    description: 'Interior wall painting in Mapusa',
    location: 'Mapusa',
    startDate: '2026-09-18',
    durationDays: 5,
    reportingTime: '8:00 AM',
    workersRequired: 3,
    skills: ['Painting', 'Wall Putty', 'Surface Prep'],
    experienceRequired: 3,
    preferredLanguage: 'mr',
    paymentType: 'daily',
    paymentAmount: 800,
    status: 'open',
    shortlistedWorkerIds: [],
    notifiedWorkerIds: [],
    interestedWorkerIds: [],
    assignedWorkerIds: [],
    completedWorkerIds: [],
    createdAt: new Date().toISOString()
  };

  const perfectWorker: FreelancerProfile & { id: string; name: string; phone: string } = {
    id: 'W-PERFECT',
    freelancerId: 'W-PERFECT',
    name: 'Ramesh Naik',
    phone: '+91 98221 44550',
    primarySkill: 'Painting',
    additionalSkills: ['Wall Putty', 'Texture Painting'],
    experienceYears: 8,
    dailyRate: 800,
    location: 'Mapusa, North Goa',
    serviceAreas: ['Mapusa', 'Porvorim'],
    distanceKm: 2.1,
    availability: 'available',
    languages: ['Konkani', 'Marathi', 'Hindi'],
    preferredLanguage: 'mr',
    rating: 4.9,
    completedJobs: 42,
    bio: 'Experienced painter'
  };

  const partialWorker: FreelancerProfile & { id: string; name: string; phone: string } = {
    id: 'W-PARTIAL',
    freelancerId: 'W-PARTIAL',
    name: 'Santosh Kumar',
    phone: '+91 98221 99999',
    primarySkill: 'Plumbing',
    additionalSkills: ['Painting'],
    experienceYears: 2,
    dailyRate: 750,
    location: 'Margao, South Goa',
    serviceAreas: ['Margao'],
    distanceKm: 35.0,
    availability: 'busy',
    languages: ['Hindi', 'English'],
    preferredLanguage: 'hi',
    rating: 4.2,
    completedJobs: 10,
    bio: 'Plumber with basic painting'
  };

  it('calculates maximum match score components for exact primary skill, location, experience, availability, and language', () => {
    const result = calculateWorkerMatchScore(sampleJob, perfectWorker);
    expect(result.breakdown.skillScore).toBe(40); // 40% weight
    expect(result.breakdown.locationScore).toBe(20); // 20% weight
    expect(result.breakdown.experienceScore).toBe(15); // 15% weight
    expect(result.breakdown.availabilityScore).toBe(15); // 15% weight
    expect(result.breakdown.languageScore).toBe(10); // 10% weight
    expect(result.matchScore).toBe(100);
  });

  it('accurately scores non-primary skill and remote location lower', () => {
    const result = calculateWorkerMatchScore(sampleJob, partialWorker);
    expect(result.breakdown.skillScore).toBe(25);
    expect(result.breakdown.locationScore).toBe(8);
    expect(result.breakdown.experienceScore).toBe(7);
    expect(result.breakdown.availabilityScore).toBe(5);
    expect(result.breakdown.languageScore).toBe(6);
    expect(result.matchScore).toBeLessThan(60);
  });

  it('ranks workers strictly in descending order of weighted match score', () => {
    const users: User[] = [
      {
        id: partialWorker.id,
        name: partialWorker.name,
        email: 'santosh@example.com',
        mobile: partialWorker.phone,
        role: 'freelancer',
        location: partialWorker.location,
        createdAt: new Date().toISOString(),
        freelancerProfile: partialWorker
      },
      {
        id: perfectWorker.id,
        name: perfectWorker.name,
        email: 'ramesh@example.com',
        mobile: perfectWorker.phone,
        role: 'freelancer',
        location: perfectWorker.location,
        createdAt: new Date().toISOString(),
        freelancerProfile: perfectWorker
      }
    ];

    const ranked = findMatchingWorkers(sampleJob, users);
    expect(ranked.length).toBe(2);
    expect(ranked[0].worker.name).toBe('Ramesh Naik');
    expect(ranked[0].matchScore).toBeGreaterThan(ranked[1].matchScore);
  });
});
