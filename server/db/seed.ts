import db from './database';
import { runMigrations } from './migrations';
import { hashPassword } from '../utils/password';

export function runSeed() {
  runMigrations();

  const insertSkill = db.prepare(`
    INSERT OR IGNORE INTO skills (id, name, category, created_at)
    VALUES (?, ?, ?, datetime('now'))
  `);

  const insertLang = db.prepare(`
    INSERT OR IGNORE INTO languages (id, name, code)
    VALUES (?, ?, ?)
  `);

  const insertUser = db.prepare(`
    INSERT OR REPLACE INTO users (id, role, name, email, phone, password_hash, salt, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `);

  const insertCustomer = db.prepare(`
    INSERT OR REPLACE INTO customers (id, user_id, organization, created_at, updated_at)
    VALUES (?, ?, ?, datetime('now'), datetime('now'))
  `);

  const insertFreelancer = db.prepare(`
    INSERT OR REPLACE INTO freelancers (id, user_id, freelancer_id, trade_category, bio, location, daily_rate, experience_years, rating, completed_jobs, availability, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `);

  const insertFreelancerSkill = db.prepare(`
    INSERT OR IGNORE INTO freelancer_skills (freelancer_id, skill_id)
    VALUES (?, ?)
  `);

  const insertFreelancerLang = db.prepare(`
    INSERT OR IGNORE INTO freelancer_languages (freelancer_id, language_id)
    VALUES (?, ?)
  `);

  const insertJob = db.prepare(`
    INSERT OR REPLACE INTO jobs (id, customer_id, customer_name, customer_phone, title, category, description, location, start_date, duration_days, reporting_time, workers_required, payment_type, payment_amount, status, experience_required, preferred_language, assigned_worker_ids, skills_json, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `);

  const insertHistory = db.prepare(`
    INSERT OR REPLACE INTO work_history (id, job_id, worker_id, customer_id, job_title, job_category, job_location, payment_amount, completed_at, rating, review, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `);

  db.transaction(() => {
    // 1. Skills
    const skills = [
      { id: 'sk-p1', name: 'Exterior Weather Coating', category: 'Painter' },
      { id: 'sk-p2', name: 'Scaffold Work', category: 'Painter' },
      { id: 'sk-p3', name: 'Waterproofing', category: 'Painter' },
      { id: 'sk-p4', name: 'Interior Wall Finish', category: 'Painter' },
      { id: 'sk-pl1', name: 'PPR Pipe Welded Joint', category: 'Plumber' },
      { id: 'sk-pl2', name: 'Drain Unclogging', category: 'Plumber' },
      { id: 'sk-pl3', name: 'Pressure Testing', category: 'Plumber' },
      { id: 'sk-pl4', name: 'Geyser Installation', category: 'Plumber' },
      { id: 'sk-c1', name: 'Door Frame Fitting', category: 'Carpenter' },
      { id: 'sk-c2', name: 'Furniture Assembly', category: 'Carpenter' },
      { id: 'sk-c3', name: 'Modular Kitchens', category: 'Carpenter' },
      { id: 'sk-m1', name: 'Diesel Generator Repair', category: 'Mechanic' },
      { id: 'sk-m2', name: 'Concrete Mixer Engine', category: 'Mechanic' },
      { id: 'sk-m3', name: 'Hydraulic Pumps', category: 'Mechanic' },
    ];
    for (const s of skills) {
      insertSkill.run(s.id, s.name, s.category);
    }

    // 2. Languages
    const langs = [
      { id: 'lang-en', name: 'English', code: 'en' },
      { id: 'lang-hi', name: 'Hindi', code: 'hi' },
      { id: 'lang-mr', name: 'Marathi', code: 'mr' },
    ];
    for (const l of langs) {
      insertLang.run(l.id, l.name, l.code);
    }

    // Default password hash for demo accounts: "password123"
    const defaultAuth = hashPassword('password123');

    // 3. Customers
    const customers = [
      {
        id: 'cust-1',
        name: 'Rajesh Sharma',
        email: 'rajesh@sharmaconstruction.com',
        phone: '+91 98200 11223',
        org: 'Goa Civil & Infra Projects Ltd'
      },
      {
        id: 'cust-2',
        name: 'Anita Desai',
        email: 'anita@desaiinteriors.com',
        phone: '+91 98200 22334',
        org: 'Desai Interiors & Luxury Living'
      },
      {
        id: 'cust-3',
        name: 'Vikram Singhania',
        email: 'vikram.s@coastalhubs.in',
        phone: '+91 98111 77654',
        org: 'Coastal Hubs & Retail Plazas'
      },
      {
        id: 'cust-4',
        name: 'Dr. Sneha Patil',
        email: 'sneha.patil@heritagevilla.org',
        phone: '+91 98450 88219',
        org: 'Assagao Heritage Villa Estates'
      },
      {
        id: 'cust-5',
        name: 'Karan Malhotra',
        email: 'karan.m@sunandsandgoa.com',
        phone: '+91 98332 66541',
        org: 'Sun & Sand Beachfront Resorts'
      }
    ];

    for (const c of customers) {
      insertUser.run(c.id, 'customer', c.name, c.email, c.phone, defaultAuth.hash, defaultAuth.salt);
      insertCustomer.run(`profile-${c.id}`, c.id, c.org);
    }

    // 4. Freelancers
    const freelancers = [
      {
        userId: 'worker-1',
        freelancerId: 'SQ-F-1042',
        name: 'Ramesh Naik',
        phone: '+91 98201 44521',
        email: 'ramesh.naik@shramik.internal',
        trade: 'Painter',
        bio: 'Lead painter with 8+ years experience across North Goa. Specializes in multi-storey exterior acrylic emulsion, scaffolding safety, and texture finishes.',
        location: 'Mapusa, Goa',
        rate: 800,
        exp: 8,
        rating: 4.8,
        jobs: 126,
        skills: ['sk-p1', 'sk-p2', 'sk-p3', 'sk-p4'],
        langs: ['lang-mr', 'lang-hi', 'lang-en']
      },
      {
        userId: 'worker-2',
        freelancerId: 'SQ-F-1052',
        name: 'Sunil Gaonkar',
        phone: '+91 94220 55112',
        email: 'sunil.gaonkar@shramik.internal',
        trade: 'Plumber',
        bio: 'Expert sanitary technician with 9 years experience. Specializes in PPR pipe welded joints, overhead tank ball valves, and bathroom leak detection.',
        location: 'Porvorim, Goa',
        rate: 850,
        exp: 9,
        rating: 4.8,
        jobs: 118,
        skills: ['sk-pl1', 'sk-pl2', 'sk-pl3', 'sk-pl4'],
        langs: ['lang-mr', 'lang-hi', 'lang-en']
      },
      {
        userId: 'worker-3',
        freelancerId: 'SQ-F-1045',
        name: 'Ganesh More',
        phone: '+91 98902 33419',
        email: 'ganesh.more@shramik.internal',
        trade: 'Carpenter',
        bio: 'ITI certified carpentry craftsman with 7 years experience. Expertise in custom door frames, modular kitchen cabinets, and wooden shutter alignments.',
        location: 'Panjim, Goa',
        rate: 900,
        exp: 7,
        rating: 4.8,
        jobs: 110,
        skills: ['sk-c1', 'sk-c2', 'sk-c3'],
        langs: ['lang-mr', 'lang-hi']
      },
      {
        userId: 'worker-4',
        freelancerId: 'SQ-F-1049',
        name: 'Anand Jadhav',
        phone: '+91 94051 66209',
        email: 'anand.jadhav@shramik.internal',
        trade: 'Mechanic',
        bio: '11 years experience in construction machinery, diesel concrete mixers, batching plant pumps, and site generator diagnostics.',
        location: 'Mapusa, Goa',
        rate: 950,
        exp: 11,
        rating: 4.9,
        jobs: 160,
        skills: ['sk-m1', 'sk-m2', 'sk-m3'],
        langs: ['lang-mr', 'lang-hi', 'lang-en']
      }
    ];

    for (const f of freelancers) {
      insertUser.run(f.userId, 'freelancer', f.name, f.email, f.phone, defaultAuth.hash, defaultAuth.salt);
      const flId = `fl-${f.userId}`;
      insertFreelancer.run(flId, f.userId, f.freelancerId, f.trade, f.bio, f.location, f.rate, f.exp, f.rating, f.jobs, 'available');

      for (const sId of f.skills) {
        insertFreelancerSkill.run(flId, sId);
      }
      for (const lId of f.langs) {
        insertFreelancerLang.run(flId, lId);
      }
    }

    // 5. Initial Jobs
    const jobs = [
      {
        id: 'job-101',
        customerId: 'cust-1',
        customerName: 'Rajesh Sharma',
        customerPhone: '+91 98200 11223',
        title: '4-Storey Exterior Weather Coating & Waterproofing Project',
        category: 'Painter',
        description: 'Bulk residential painting project in Mapusa Industrial Area. Requires exterior scaffolding setup, primer roll application, and two coats of weather-shield emulsion with waterproofing membrane.',
        location: 'Mapusa, Goa',
        startDate: '2026-09-20',
        durationDays: 5,
        reportingTime: '08:00 AM',
        workersRequired: 10,
        paymentType: 'daily',
        paymentAmount: 800,
        status: 'open',
        exp: 2,
        lang: 'mr',
        skills: ['Exterior Weather Coating', 'Scaffold Work', 'Waterproofing']
      },
      {
        id: 'job-102',
        customerId: 'cust-2',
        customerName: 'Anita Desai',
        customerPhone: '+91 98200 22334',
        title: 'Emergency Bathroom Pipe Burst & Sanitary Plumbing Repair',
        category: 'Plumber',
        description: 'Concealed PPR pipe welded joint burst causing water leakage into living room. Requires pressure testing, wall opening, pipe replacement, and tile resealing.',
        location: 'Porvorim, Goa',
        startDate: '2026-09-18',
        durationDays: 1,
        reportingTime: '09:00 AM',
        workersRequired: 1,
        paymentType: 'daily',
        paymentAmount: 850,
        status: 'open',
        exp: 3,
        lang: 'hi',
        skills: ['PPR Pipe Welded Joint', 'Drain Unclogging', 'Pressure Testing']
      },
      {
        id: 'job-103',
        customerId: 'cust-1',
        customerName: 'Rajesh Sharma',
        customerPhone: '+91 98200 11223',
        title: 'Custom Wooden Door Frames, Shutter Fitting & Modular Kitchen',
        category: 'Carpenter',
        description: 'Teak wood door frame alignment, hydraulic hinge fitting, and modular kitchen cabinet shutter assembly for a sea-facing apartment.',
        location: 'Panjim, Goa',
        startDate: '2026-09-25',
        durationDays: 4,
        reportingTime: '08:30 AM',
        workersRequired: 2,
        paymentType: 'daily',
        paymentAmount: 900,
        status: 'open',
        exp: 4,
        lang: 'en',
        skills: ['Door Frame Fitting', 'Furniture Assembly', 'Modular Kitchens']
      },
      {
        id: 'job-104',
        customerId: 'cust-3',
        customerName: 'Vikram Singhania',
        customerPhone: '+91 98111 77654',
        title: 'Commercial Plaza 3-Phase Electrical Rewiring & DG Backup Overhaul',
        category: 'Mechanic',
        description: 'Main distribution board overhaul, 3-phase balancing, circuit breaker testing, and 125kVA diesel generator engine oil/filter servicing for commercial retail mall.',
        location: 'Panjim Coastal Highway, Goa',
        startDate: '2026-09-22',
        durationDays: 2,
        reportingTime: '07:30 AM',
        workersRequired: 3,
        paymentType: 'daily',
        paymentAmount: 950,
        status: 'open',
        exp: 5,
        lang: 'mr',
        skills: ['Diesel Generator Repair', 'Concrete Mixer Engine', 'Hydraulic Pumps']
      },
      {
        id: 'job-105',
        customerId: 'cust-4',
        customerName: 'Dr. Sneha Patil',
        customerPhone: '+91 98450 88219',
        title: 'Portuguese Villa Red Laterite Stone Boundary Wall & Plastering',
        category: 'Mason',
        description: 'Chiseling and laying red laterite stone blocks with lime mortar mix, leveling compound wall, and applying weather-resistant exterior plaster.',
        location: 'Assagao, Goa',
        startDate: '2026-09-21',
        durationDays: 4,
        reportingTime: '08:00 AM',
        workersRequired: 2,
        paymentType: 'daily',
        paymentAmount: 850,
        status: 'open',
        exp: 5,
        lang: 'mr',
        skills: ['Red Laterite Masonry', 'Level Plastering', 'Stone Chisel']
      },
      {
        id: 'job-106',
        customerId: 'cust-5',
        customerName: 'Karan Malhotra',
        customerPhone: '+91 98332 66541',
        title: 'Beachfront Wooden Deck Polishing & Anti-Moisture Sealing',
        category: 'Carpenter',
        description: 'Sanding 2,400 sq ft exterior teak deck, replacing rusted brass screws, and applying 2 coats of marine-grade polyurethane anti-moisture sealant ahead of tourist season.',
        location: 'Calangute Beach Road, Goa',
        startDate: '2026-09-23',
        durationDays: 3,
        reportingTime: '08:00 AM',
        workersRequired: 2,
        paymentType: 'daily',
        paymentAmount: 850,
        status: 'open',
        exp: 3,
        lang: 'hi',
        skills: ['Door Frame Fitting', 'Furniture Assembly']
      },
      {
        id: 'job-past-1',
        customerId: 'cust-1',
        customerName: 'Rajesh Sharma',
        customerPhone: '+91 98200 11223',
        title: 'Residential Exterior Villa Repainting',
        category: 'Painter',
        description: 'Repainting of 2-storey Portuguese style villa with anti-fungal exterior emulsion.',
        location: 'Mapusa, Goa',
        startDate: '2026-08-20',
        durationDays: 5,
        reportingTime: '08:00 AM',
        workersRequired: 1,
        paymentType: 'daily',
        paymentAmount: 800,
        status: 'completed',
        exp: 2,
        lang: 'mr',
        skills: ['Exterior Weather Coating', 'Scaffold Work']
      },
      {
        id: 'job-past-2',
        customerId: 'cust-2',
        customerName: 'Anita Desai',
        customerPhone: '+91 98200 22334',
        title: 'Commercial Restroom Pipeline Replacement',
        category: 'Plumber',
        description: 'Complete overhaul of commercial pipe network with pressure valves.',
        location: 'Porvorim, Goa',
        startDate: '2026-08-27',
        durationDays: 3,
        reportingTime: '09:00 AM',
        workersRequired: 1,
        paymentType: 'daily',
        paymentAmount: 850,
        status: 'completed',
        exp: 3,
        lang: 'en',
        skills: ['PPR Pipe Welded Joint', 'Pressure Testing']
      }
    ];

    for (const j of jobs) {
      insertJob.run(
        j.id,
        j.customerId,
        j.customerName,
        j.customerPhone,
        j.title,
        j.category,
        j.description,
        j.location,
        j.startDate,
        j.durationDays,
        j.reportingTime,
        j.workersRequired,
        j.paymentType,
        j.paymentAmount,
        j.status,
        j.exp,
        j.lang,
        '[]',
        JSON.stringify(j.skills)
      );
    }

    // 6. Work History
    insertHistory.run(
      'hist-1',
      'job-past-1',
      'SQ-F-1042',
      'cust-1',
      'Residential Exterior Villa Repainting',
      'Painter',
      'Mapusa, Goa',
      4000,
      '2026-08-25',
      5.0,
      'Excellent work, clean lines, completed ahead of schedule.'
    );

    insertHistory.run(
      'hist-2',
      'job-past-2',
      'SQ-F-1052',
      'cust-2',
      'Commercial Restroom Pipeline Replacement',
      'Plumber',
      'Porvorim, Goa',
      2550,
      '2026-08-30',
      4.8,
      'Prompt arrival for emergency plumbing callout, very knowledgeable.'
    );
  })();

  console.log('Database seeding completed successfully.');
}

if (process.argv[1]?.includes('seed.ts') || process.argv[1]?.includes('seed')) {
  runSeed();
}
