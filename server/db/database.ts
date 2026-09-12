import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Ensure data directory exists
const dataDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const dbPath = path.resolve(dataDir, 'shramik.db');

export const db = new Database(dbPath, {
  // verbose: process.env.NODE_ENV === 'development' ? console.log : undefined
});

// Enforce foreign key constraints and enable Write-Ahead Logging for high concurrency
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

export default db;
