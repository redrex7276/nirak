import db from '../db/database';

export interface FreelancerFilters {
  search?: string;
  skill?: string;
  category?: string;
  location?: string;
  availability?: string;
  page?: number;
  limit?: number;
}

export class FreelancerService {
  /**
   * Format full freelancer record with linked skills and languages
   */
  private formatFreelancer(flRow: any) {
    const user = db.prepare('SELECT name, email, phone FROM users WHERE id = ?').get(flRow.user_id) as any;

    const skills = db.prepare(`
      SELECT s.name FROM skills s
      JOIN freelancer_skills fs ON fs.skill_id = s.id
      WHERE fs.freelancer_id = ?
    `).all(flRow.id) as { name: string }[];

    const languages = db.prepare(`
      SELECT l.name, l.code FROM languages l
      JOIN freelancer_languages flg ON flg.language_id = l.id
      WHERE flg.freelancer_id = ?
    `).all(flRow.id) as { name: string; code: string }[];

    return {
      id: flRow.user_id,
      freelancerId: flRow.freelancer_id,
      name: user?.name || 'Worker',
      email: user?.email || '',
      phone: user?.phone || '',
      tradeCategory: flRow.trade_category,
      bio: flRow.bio || '',
      location: flRow.location,
      dailyRate: flRow.daily_rate,
      experienceYears: flRow.experience_years,
      rating: flRow.rating,
      completedJobs: flRow.completed_jobs,
      availability: flRow.availability,
      skills: skills.map(s => s.name),
      languages: languages.map(l => l.code),
      createdAt: flRow.created_at,
      updatedAt: flRow.updated_at
    };
  }

  /**
   * Search and filter freelancers from database
   */
  getFreelancers(filters: FreelancerFilters = {}) {
    const conditions: string[] = [];
    const params: any[] = [];

    if (filters.category && filters.category !== 'all') {
      conditions.push('lower(f.trade_category) = lower(?)');
      params.push(filters.category.trim());
    }

    if (filters.availability && filters.availability !== 'all') {
      conditions.push('f.availability = ?');
      params.push(filters.availability.trim().toLowerCase());
    }

    if (filters.location && filters.location !== 'all') {
      conditions.push('lower(f.location) LIKE lower(?)');
      params.push(`%${filters.location.trim()}%`);
    }

    if (filters.search?.trim()) {
      const term = `%${filters.search.trim()}%`;
      conditions.push(`(
        lower(u.name) LIKE lower(?) OR 
        lower(f.trade_category) LIKE lower(?) OR 
        lower(f.location) LIKE lower(?) OR 
        lower(f.bio) LIKE lower(?) OR
        lower(f.freelancer_id) LIKE lower(?)
      )`);
      params.push(term, term, term, term, term);
    }

    if (filters.skill?.trim()) {
      const sTerm = filters.skill.trim();
      conditions.push(`(
        lower(f.trade_category) = lower(?) OR
        EXISTS (
          SELECT 1 FROM freelancer_skills fs
          JOIN skills s ON s.id = fs.skill_id
          WHERE fs.freelancer_id = f.id AND (lower(s.name) LIKE lower(?) OR lower(s.category) = lower(?))
        )
      )`);
      params.push(sTerm, `%${sTerm}%`, sTerm);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRow = db.prepare(`
      SELECT count(*) as total 
      FROM freelancers f
      JOIN users u ON u.id = f.user_id
      ${whereClause}
    `).get(...params) as any;
    const total = countRow?.total || 0;

    const page = Math.max(1, filters.page || 1);
    const limit = Math.max(1, Math.min(100, filters.limit || 50));
    const offset = (page - 1) * limit;

    const rows = db.prepare(`
      SELECT f.*, u.name, u.email, u.phone 
      FROM freelancers f
      JOIN users u ON u.id = f.user_id
      ${whereClause}
      ORDER BY f.rating DESC, f.completed_jobs DESC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset) as any[];

    return {
      freelancers: rows.map(r => this.formatFreelancer(r)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Get single freelancer by user ID or freelancerId (e.g. SQ-F-1042)
   */
  getFreelancerById(idOrFreelancerId: string) {
    const row = db.prepare(`
      SELECT * FROM freelancers 
      WHERE user_id = ? OR freelancer_id = ? OR id = ?
    `).get(idOrFreelancerId, idOrFreelancerId, idOrFreelancerId) as any;

    if (!row) return null;
    return this.formatFreelancer(row);
  }

  /**
   * Update freelancer profile data
   */
  updateFreelancerProfile(userId: string, updates: {
    name?: string;
    bio?: string;
    location?: string;
    dailyRate?: number;
    availability?: 'available' | 'busy' | 'offline';
    skills?: string[];
    languages?: string[];
  }) {
    const fl = db.prepare('SELECT * FROM freelancers WHERE user_id = ?').get(userId) as any;
    if (!fl) throw new Error('Freelancer record not found.');

    return db.transaction(() => {
      if (updates.name) {
        db.prepare("UPDATE users SET name = ?, updated_at = datetime('now') WHERE id = ?").run(updates.name.trim(), userId);
      }

      const flUpdates: string[] = [];
      const flParams: any[] = [];

      if (updates.bio !== undefined) { flUpdates.push('bio = ?'); flParams.push(updates.bio.trim()); }
      if (updates.location) { flUpdates.push('location = ?'); flParams.push(updates.location.trim()); }
      if (updates.dailyRate) { flUpdates.push('daily_rate = ?'); flParams.push(updates.dailyRate); }
      if (updates.availability) { flUpdates.push('availability = ?'); flParams.push(updates.availability); }

      if (flUpdates.length > 0) {
        flUpdates.push("updated_at = datetime('now')");
        flParams.push(fl.id);
        db.prepare(`UPDATE freelancers SET ${flUpdates.join(', ')} WHERE id = ?`).run(...flParams);
      }

      // Update skills if provided
      if (updates.skills) {
        db.prepare('DELETE FROM freelancer_skills WHERE freelancer_id = ?').run(fl.id);
        for (const sName of updates.skills) {
          let skill = db.prepare('SELECT id FROM skills WHERE name = ?').get(sName) as any;
          if (!skill) {
            const newSkillId = `sk-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            db.prepare('INSERT INTO skills (id, name, category, created_at) VALUES (?, ?, ?, datetime("now"))')
              .run(newSkillId, sName, fl.trade_category);
            skill = { id: newSkillId };
          }
          db.prepare('INSERT OR IGNORE INTO freelancer_skills (freelancer_id, skill_id) VALUES (?, ?)').run(fl.id, skill.id);
        }
      }

      // Update languages if provided
      if (updates.languages) {
        db.prepare('DELETE FROM freelancer_languages WHERE freelancer_id = ?').run(fl.id);
        for (const lCode of updates.languages) {
          const lang = db.prepare('SELECT id FROM languages WHERE code = ? OR name = ?').get(lCode, lCode) as any;
          if (lang) {
            db.prepare('INSERT OR IGNORE INTO freelancer_languages (freelancer_id, language_id) VALUES (?, ?)').run(fl.id, lang.id);
          }
        }
      }

      return this.getFreelancerById(userId);
    })();
  }

  /**
   * Fast availability toggle
   */
  updateAvailability(userId: string, availability: 'available' | 'busy' | 'offline') {
    db.prepare("UPDATE freelancers SET availability = ?, updated_at = datetime('now') WHERE user_id = ?")
      .run(availability, userId);
    return this.getFreelancerById(userId);
  }

  /**
   * Get historical completed jobs for freelancer
   */
  getFreelancerHistory(workerId: string) {
    const rows = db.prepare(`
      SELECT * FROM work_history 
      WHERE worker_id = ? 
         OR worker_id = (SELECT freelancer_id FROM freelancers WHERE user_id = ?)
      ORDER BY completed_at DESC
    `).all(workerId, workerId) as any[];

    return rows.map(r => ({
      id: r.id,
      jobId: r.job_id,
      workerId: r.worker_id,
      customerId: r.customer_id,
      jobTitle: r.job_title,
      jobCategory: r.job_category,
      jobLocation: r.job_location,
      paymentAmount: r.payment_amount,
      completedAt: r.completed_at,
      rating: r.rating,
      review: r.review
    }));
  }
}

export const freelancerService = new FreelancerService();
