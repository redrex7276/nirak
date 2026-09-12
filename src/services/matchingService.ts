import { Job, FreelancerProfile, MatchResult, User } from '../types';

export function calculateWorkerMatchScore(
  job: Job,
  worker: FreelancerProfile & { id: string; name: string; phone: string }
): MatchResult {
  // 1. Skill Match (40% Weight)
  let skillScore = 0;
  if (worker.primarySkill.toLowerCase() === job.category.toLowerCase()) {
    skillScore = 40;
  } else if (
    worker.additionalSkills.some(s => s.toLowerCase().includes(job.category.toLowerCase())) ||
    job.skills.some(reqSkill => worker.additionalSkills.some(as => as.toLowerCase().includes(reqSkill.toLowerCase())))
  ) {
    skillScore = 25;
  } else {
    // If worker has painting or similar experience
    skillScore = 15;
  }

  // 2. Location / Proximity Match (20% Weight)
  let locationScore = 0;
  const jobLoc = job.location.toLowerCase();
  const workerLoc = worker.location.toLowerCase();
  if (workerLoc.includes('mapusa') && jobLoc.includes('mapusa')) {
    locationScore = 20;
  } else if (
    worker.serviceAreas.some(area => jobLoc.includes(area.toLowerCase())) ||
    (worker.distanceKm !== undefined && worker.distanceKm <= 5)
  ) {
    locationScore = 16;
  } else if (worker.distanceKm !== undefined && worker.distanceKm <= 10) {
    locationScore = 12;
  } else {
    locationScore = 8;
  }

  // 3. Experience Match (15% Weight)
  let experienceScore = 0;
  const reqExp = job.experienceRequired || 1;
  if (worker.experienceYears >= reqExp + 3) {
    experienceScore = 15;
  } else if (worker.experienceYears >= reqExp) {
    experienceScore = 12;
  } else {
    experienceScore = 7;
  }

  // 4. Availability Match (15% Weight)
  let availabilityScore = 0;
  if (worker.availability === 'available') {
    availabilityScore = 15;
  } else if (worker.availability === 'busy') {
    availabilityScore = 5;
  } else {
    availabilityScore = 0;
  }

  // 5. Language Preference (10% Weight)
  let languageScore = 0;
  if (worker.preferredLanguage === job.preferredLanguage) {
    languageScore = 10;
  } else {
    languageScore = 6;
  }

  const matchScore = skillScore + locationScore + experienceScore + availabilityScore + languageScore;

  return {
    worker,
    matchScore,
    breakdown: {
      skillScore,
      locationScore,
      experienceScore,
      availabilityScore,
      languageScore
    }
  };
}

export function findMatchingWorkers(
  job: Job,
  allUsers: User[]
): MatchResult[] {
  const freelancers = allUsers
    .filter(u => u.role === 'freelancer' && u.freelancerProfile)
    .map(u => ({
      ...u.freelancerProfile!,
      id: u.id,
      name: u.name,
      phone: u.mobile
    }));

  const results = freelancers.map(worker => calculateWorkerMatchScore(job, worker));

  // Sort descending by score, then rating
  return results.sort((a, b) => {
    if (b.matchScore !== a.matchScore) {
      return b.matchScore - a.matchScore;
    }
    return b.worker.rating - a.worker.rating;
  });
}
