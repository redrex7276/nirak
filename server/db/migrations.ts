import db from './database';

export function runMigrations() {
  db.exec(`
    -- 1. Users Table
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      role TEXT NOT NULL CHECK(role IN ('customer', 'freelancer', 'admin')),
      name TEXT NOT NULL,
      email TEXT UNIQUE,
      phone TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

    -- 2. Customers Table
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      organization TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);

    -- 3. Freelancers Table
    CREATE TABLE IF NOT EXISTS freelancers (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      freelancer_id TEXT UNIQUE NOT NULL,
      trade_category TEXT NOT NULL,
      bio TEXT,
      location TEXT NOT NULL,
      daily_rate INTEGER NOT NULL DEFAULT 800,
      experience_years INTEGER NOT NULL DEFAULT 1,
      rating REAL NOT NULL DEFAULT 4.5,
      completed_jobs INTEGER NOT NULL DEFAULT 0,
      availability TEXT NOT NULL DEFAULT 'available' CHECK(availability IN ('available', 'busy', 'offline')),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_freelancers_user_id ON freelancers(user_id);
    CREATE INDEX IF NOT EXISTS idx_freelancers_freelancer_id ON freelancers(freelancer_id);
    CREATE INDEX IF NOT EXISTS idx_freelancers_category ON freelancers(trade_category);
    CREATE INDEX IF NOT EXISTS idx_freelancers_location ON freelancers(location);
    CREATE INDEX IF NOT EXISTS idx_freelancers_availability ON freelancers(availability);

    -- 4. Skills Table
    CREATE TABLE IF NOT EXISTS skills (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      category TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    -- 5. Languages Table
    CREATE TABLE IF NOT EXISTS languages (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      code TEXT UNIQUE NOT NULL
    );

    -- 6. Freelancer Skills (Many-to-Many)
    CREATE TABLE IF NOT EXISTS freelancer_skills (
      freelancer_id TEXT NOT NULL REFERENCES freelancers(id) ON DELETE CASCADE,
      skill_id TEXT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
      PRIMARY KEY (freelancer_id, skill_id)
    );

    -- 7. Freelancer Languages (Many-to-Many)
    CREATE TABLE IF NOT EXISTS freelancer_languages (
      freelancer_id TEXT NOT NULL REFERENCES freelancers(id) ON DELETE CASCADE,
      language_id TEXT NOT NULL REFERENCES languages(id) ON DELETE CASCADE,
      PRIMARY KEY (freelancer_id, language_id)
    );

    -- 8. Jobs Table
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      location TEXT NOT NULL,
      start_date TEXT NOT NULL,
      duration_days INTEGER NOT NULL DEFAULT 1,
      reporting_time TEXT NOT NULL DEFAULT '08:00 AM',
      workers_required INTEGER NOT NULL DEFAULT 1,
      payment_type TEXT NOT NULL DEFAULT 'daily' CHECK(payment_type IN ('daily', 'fixed')),
      payment_amount INTEGER NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('draft', 'open', 'sms_sent', 'responses_received', 'assigned', 'in_progress', 'completed', 'cancelled')),
      experience_required INTEGER NOT NULL DEFAULT 0,
      preferred_language TEXT NOT NULL DEFAULT 'en',
      assigned_worker_ids TEXT NOT NULL DEFAULT '[]',
      skills_json TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_jobs_customer_id ON jobs(customer_id);
    CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
    CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category);
    CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);
    CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at);

    -- 9. Job Applications / Candidate Opportunities
    CREATE TABLE IF NOT EXISTS job_applications (
      id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
      worker_id TEXT NOT NULL,
      worker_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      status TEXT NOT NULL CHECK(status IN ('selected', 'sms_sent', 'waiting_for_details_request', 'details_sent', 'waiting_for_acceptance', 'accepted', 'rejected', 'invalid_response', 'assigned', 'expired')),
      sms_state TEXT NOT NULL DEFAULT 'SMS_SENT',
      sent_at TEXT NOT NULL,
      responded_at TEXT,
      assigned_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(job_id, worker_id)
    );

    CREATE INDEX IF NOT EXISTS idx_applications_job_id ON job_applications(job_id);
    CREATE INDEX IF NOT EXISTS idx_applications_worker_id ON job_applications(worker_id);
    CREATE INDEX IF NOT EXISTS idx_applications_status ON job_applications(status);

    -- 10. SMS Messages Table
    CREATE TABLE IF NOT EXISTS sms_messages (
      id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
      worker_id TEXT NOT NULL,
      worker_name TEXT NOT NULL,
      worker_phone TEXT NOT NULL,
      direction TEXT NOT NULL CHECK(direction IN ('outgoing', 'incoming')),
      content TEXT NOT NULL,
      step TEXT,
      status TEXT NOT NULL CHECK(status IN ('queued', 'sent', 'delivered', 'failed', 'received')),
      provider_message_id TEXT UNIQUE,
      timestamp TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_sms_job_id ON sms_messages(job_id);
    CREATE INDEX IF NOT EXISTS idx_sms_worker_id ON sms_messages(worker_id);
    CREATE INDEX IF NOT EXISTS idx_sms_direction ON sms_messages(direction);

    -- 11. Assignments Table
    CREATE TABLE IF NOT EXISTS assignments (
      id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
      freelancer_id TEXT NOT NULL,
      customer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      status TEXT NOT NULL CHECK(status IN ('assigned', 'in_progress', 'completed', 'cancelled')),
      assigned_at TEXT NOT NULL,
      started_at TEXT,
      completed_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(job_id, freelancer_id)
    );

    CREATE INDEX IF NOT EXISTS idx_assignments_job_id ON assignments(job_id);
    CREATE INDEX IF NOT EXISTS idx_assignments_freelancer_id ON assignments(freelancer_id);
    CREATE INDEX IF NOT EXISTS idx_assignments_customer_id ON assignments(customer_id);

    -- 12. Work History Table
    CREATE TABLE IF NOT EXISTS work_history (
      id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
      worker_id TEXT NOT NULL,
      customer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      job_title TEXT NOT NULL,
      job_category TEXT NOT NULL,
      job_location TEXT NOT NULL,
      payment_amount INTEGER NOT NULL,
      completed_at TEXT NOT NULL,
      rating REAL,
      review TEXT,
      created_at TEXT NOT NULL,
      UNIQUE(job_id, worker_id)
    );

    CREATE INDEX IF NOT EXISTS idx_work_history_worker_id ON work_history(worker_id);
    CREATE INDEX IF NOT EXISTS idx_work_history_customer_id ON work_history(customer_id);
  `);
  console.log('Database migrations completed successfully.');
}

if (process.argv[1]?.includes('migrations.ts') || process.argv[1]?.includes('migrate')) {
  runMigrations();
}
