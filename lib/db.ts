import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'database.sqlite');

function createDatabase() {
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  return db;
}

// Singleton pattern for development (hot reload safe)
const globalForDb = globalThis as unknown as {
  db: ReturnType<typeof createDatabase> | undefined;
  dbInitialized: boolean | undefined;
};

const db = globalForDb.db ?? createDatabase();

if (process.env.NODE_ENV !== 'production') {
  globalForDb.db = db;
}

// Auto-initialize schema + seed on first load
if (!globalForDb.dbInitialized) {
  globalForDb.dbInitialized = true;

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      phone TEXT,
      nik TEXT UNIQUE,
      bpjs_number TEXT,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      avatar_url TEXT,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS health_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE,
      blood_type TEXT,
      height REAL,
      weight REAL,
      birth_date TEXT,
      gender TEXT,
      allergies TEXT,
      chronic_conditions TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS health_metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      metric_type TEXT NOT NULL,
      value REAL NOT NULL,
      unit TEXT,
      notes TEXT,
      recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS emergency_contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      relationship TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS emergency_alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      latitude REAL,
      longitude REAL,
      address TEXT,
      status TEXT DEFAULT 'active',
      message TEXT,
      responded_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS medical_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      record_type TEXT,
      doctor_name TEXT,
      facility TEXT,
      diagnosis TEXT,
      prescription TEXT,
      notes TEXT,
      attachments TEXT,
      visit_date DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS doctor_bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      doctor_name TEXT NOT NULL,
      specialty TEXT,
      facility TEXT,
      booking_date DATETIME,
      booking_time TEXT,
      status TEXT DEFAULT 'pending',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS family_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      relationship TEXT,
      birth_date TEXT,
      gender TEXT,
      blood_type TEXT,
      allergies TEXT,
      chronic_conditions TEXT,
      avatar_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS mental_health_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      mood_score INTEGER NOT NULL,
      energy_level INTEGER,
      stress_level INTEGER,
      sleep_quality INTEGER,
      notes TEXT,
      activities TEXT,
      logged_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS mental_health_assessments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      assessment_type TEXT NOT NULL,
      answers TEXT,
      total_score INTEGER,
      risk_level TEXT,
      recommendations TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS disease_detections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      symptoms TEXT NOT NULL,
      description TEXT,
      ai_result TEXT,
      risk_level TEXT,
      possible_conditions TEXT,
      recommendations TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS health_goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      goal_type TEXT NOT NULL,
      title TEXT,
      target_value REAL,
      current_value REAL DEFAULT 0,
      unit TEXT,
      deadline TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS medications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      dosage TEXT,
      frequency TEXT,
      time_of_day TEXT,
      start_date TEXT,
      end_date TEXT,
      notes TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS health_reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      reminder_type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      reminder_time TEXT,
      is_recurring INTEGER DEFAULT 0,
      recurrence_pattern TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Seed admin
  const { hashSync } = require('bcryptjs');
  const adminExists = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@sehatra.com');
  if (!adminExists) {
    const adminHash = hashSync('admin123', 12);
    db.prepare(
      'INSERT INTO users (name, email, phone, nik, bpjs_number, password_hash, role) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run('Administrator Sehatra', 'admin@sehatra.com', '081200000000', '0000000000000001', null, adminHash, 'admin');
    const adminUser = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@sehatra.com') as { id: number };
    db.prepare('INSERT INTO health_profiles (user_id) VALUES (?)').run(adminUser.id);
  }

  // Seed demo user
  const userExists = db.prepare('SELECT id FROM users WHERE email = ?').get('user@sehatra.com');
  if (!userExists) {
    const userHash = hashSync('user123', 12);
    db.prepare(
      'INSERT INTO users (name, email, phone, nik, bpjs_number, password_hash, role) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run('Demo User Sehatra', 'user@sehatra.com', '081200000001', '0000000000000002', '0001234567890', userHash, 'user');
    const demoUser = db.prepare('SELECT id FROM users WHERE email = ?').get('user@sehatra.com') as { id: number };
    db.prepare(
      'INSERT INTO health_profiles (user_id, blood_type, height, weight, birth_date, gender) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(demoUser.id, 'O', 170, 65, '1995-06-15', 'L');
  }
}

export default db;
