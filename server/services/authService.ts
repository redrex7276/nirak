import db from '../db/database';
import { hashPassword, verifyPassword } from '../utils/password';
import { generateToken, TokenPayload } from '../utils/jwt';

export interface UserDTO {
  id: string;
  role: 'customer' | 'freelancer' | 'admin';
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  customerProfile?: {
    id: string;
    organization?: string;
  };
  freelancerProfile?: {
    id: string;
    freelancerId: string;
    tradeCategory: string;
    bio?: string;
    location: string;
    dailyRate: number;
    experienceYears: number;
    rating: number;
    completedJobs: number;
    availability: 'available' | 'busy' | 'offline';
    skills: string[];
    languages: string[];
  };
}

export class AuthService {
  /**
   * Helper to format User record with relational profile
   */
  formatUser(row: any): UserDTO {
    const user: UserDTO = {
      id: row.id,
      role: row.role,
      name: row.name,
      email: row.email,
      phone: row.phone,
      createdAt: row.created_at,
    };

    if (row.role === 'customer') {
      const cust = db.prepare('SELECT * FROM customers WHERE user_id = ?').get(row.id) as any;
      if (cust) {
        user.customerProfile = {
          id: cust.id,
          organization: cust.organization || undefined
        };
      }
    } else if (row.role === 'freelancer') {
      const fl = db.prepare('SELECT * FROM freelancers WHERE user_id = ?').get(row.id) as any;
      if (fl) {
        const skills = db.prepare(`
          SELECT s.name FROM skills s
          JOIN freelancer_skills fs ON fs.skill_id = s.id
          WHERE fs.freelancer_id = ?
        `).all(fl.id) as { name: string }[];

        const langs = db.prepare(`
          SELECT l.name FROM languages l
          JOIN freelancer_languages flg ON flg.language_id = l.id
          WHERE flg.freelancer_id = ?
        `).all(fl.id) as { name: string }[];

        user.freelancerProfile = {
          id: fl.id,
          freelancerId: fl.freelancer_id,
          tradeCategory: fl.trade_category,
          bio: fl.bio || '',
          location: fl.location,
          dailyRate: fl.daily_rate,
          experienceYears: fl.experience_years,
          rating: fl.rating,
          completedJobs: fl.completed_jobs,
          availability: fl.availability,
          skills: skills.map(s => s.name),
          languages: langs.map(l => l.name)
        };
      }
    }

    return user;
  }

  /**
   * Register a new customer
   */
  registerCustomer(data: { name: string; email: string; phone: string; password?: string; organization?: string }) {
    const existing = db.prepare('SELECT id FROM users WHERE email = ? OR phone = ?').get(data.email, data.phone);
    if (existing) {
      throw new Error('A user with this email or phone number already exists.');
    }

    const userId = `cust-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const auth = hashPassword(data.password || 'password123');

    return db.transaction(() => {
      db.prepare(`
        INSERT INTO users (id, role, name, email, phone, password_hash, salt, created_at, updated_at)
        VALUES (?, 'customer', ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `).run(userId, data.name, data.email, data.phone, auth.hash, auth.salt);

      db.prepare(`
        INSERT INTO customers (id, user_id, organization, created_at, updated_at)
        VALUES (?, ?, ?, datetime('now'), datetime('now'))
      `).run(`profile-${userId}`, userId, data.organization || null);

      const user = this.getUserById(userId);
      if (!user) throw new Error('User creation failed.');

      const token = generateToken({
        userId: user.id,
        role: user.role,
        email: user.email,
        phone: user.phone,
        name: user.name
      });

      return { user, token };
    })();
  }

  /**
   * Register a new freelancer
   */
  registerFreelancer(data: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    tradeCategory: string;
    bio?: string;
    location: string;
    dailyRate?: number;
    skills?: string[];
    languages?: string[];
  }) {
    const existing = db.prepare('SELECT id FROM users WHERE email = ? OR phone = ?').get(data.email, data.phone);
    if (existing) {
      throw new Error('A worker with this email or phone number already exists.');
    }

    const userId = `worker-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const freelancerId = `SQ-F-${Math.floor(1000 + Math.random() * 9000)}`;
    const auth = hashPassword(data.password || 'password123');

    return db.transaction(() => {
      db.prepare(`
        INSERT INTO users (id, role, name, email, phone, password_hash, salt, created_at, updated_at)
        VALUES (?, 'freelancer', ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `).run(userId, data.name, data.email, data.phone, auth.hash, auth.salt);

      const flId = `fl-${userId}`;
      db.prepare(`
        INSERT INTO freelancers (id, user_id, freelancer_id, trade_category, bio, location, daily_rate, experience_years, rating, completed_jobs, availability, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1, 5.0, 0, 'available', datetime('now'), datetime('now'))
      `).run(flId, userId, freelancerId, data.tradeCategory, data.bio || '', data.location, data.dailyRate || 800);

      // Link skills
      if (data.skills && data.skills.length > 0) {
        for (const skillName of data.skills) {
          let skill = db.prepare('SELECT id FROM skills WHERE name = ?').get(skillName) as any;
          if (!skill) {
            const newSkillId = `sk-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            db.prepare('INSERT INTO skills (id, name, category, created_at) VALUES (?, ?, ?, datetime("now"))')
              .run(newSkillId, skillName, data.tradeCategory);
            skill = { id: newSkillId };
          }
          db.prepare('INSERT OR IGNORE INTO freelancer_skills (freelancer_id, skill_id) VALUES (?, ?)')
            .run(flId, skill.id);
        }
      }

      // Link languages
      if (data.languages && data.languages.length > 0) {
        for (const langCode of data.languages) {
          const lang = db.prepare('SELECT id FROM languages WHERE code = ? OR name = ?').get(langCode, langCode) as any;
          if (lang) {
            db.prepare('INSERT OR IGNORE INTO freelancer_languages (freelancer_id, language_id) VALUES (?, ?)')
              .run(flId, lang.id);
          }
        }
      }

      const user = this.getUserById(userId);
      if (!user) throw new Error('Freelancer registration failed.');

      const token = generateToken({
        userId: user.id,
        role: user.role,
        email: user.email,
        phone: user.phone,
        name: user.name
      });

      return { user, token };
    })();
  }

  /**
   * Login with email, phone, or freelancer ID
   */
  login(identifier: string, password?: string) {
    const clean = identifier.trim().toLowerCase();
    const cleanPhone = identifier.trim().replace(/\s+/g, '');

    // Search by email, phone, user.id, or freelancer_id
    const userRow = db.prepare(`
      SELECT u.* FROM users u
      LEFT JOIN freelancers f ON f.user_id = u.id
      WHERE lower(u.email) = ? 
         OR replace(u.phone, ' ', '') = ? 
         OR lower(u.id) = ? 
         OR lower(f.freelancer_id) = ?
    `).get(clean, cleanPhone, clean, clean) as any;

    if (!userRow) {
      throw new Error('Account not found. Please verify your mobile number, email, or worker ID.');
    }

    // Verify password if provided
    if (password) {
      const isValid = verifyPassword(password, userRow.password_hash, userRow.salt);
      if (!isValid) {
        throw new Error('Incorrect password. Please try again.');
      }
    }

    const user = this.formatUser(userRow);
    const token = generateToken({
      userId: user.id,
      role: user.role,
      email: user.email,
      phone: user.phone,
      name: user.name
    });

    return { user, token };
  }

  /**
   * Get user by ID
   */
  getUserById(id: string): UserDTO | null {
    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
    if (!row) return null;
    return this.formatUser(row);
  }

  /**
   * Get all registered users
   */
  getAllUsers(): UserDTO[] {
    const rows = db.prepare('SELECT * FROM users ORDER BY created_at DESC').all() as any[];
    return rows.map(r => this.formatUser(r));
  }
}

export const authService = new AuthService();
